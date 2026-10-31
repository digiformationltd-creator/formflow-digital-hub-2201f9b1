-- LOCAL PATCH ONLY. Apply together with the matching Edge Functions after
-- approval, a database backup and a real PostgreSQL integration test.
-- Requires existing email_prospects, CRM tables, pg_net and Supabase Vault.
-- No credential is embedded here. Configure Vault entries privately:
--   prospect_qualification_function_url (the project's full HTTPS endpoint)
--   email_queue_service_role_key (existing service key used by email jobs)

CREATE TABLE IF NOT EXISTS public.prospect_request_windows (
  operation text PRIMARY KEY CHECK (operation IN ('inbound_reply', 'qualification')),
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count >= 0)
);
CREATE TABLE IF NOT EXISTS public.prospect_inbound_receipts (
  message_id text PRIMARY KEY CHECK (length(message_id) BETWEEN 1 AND 256),
  received_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.prospect_request_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_inbound_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.prospect_request_windows, public.prospect_inbound_receipts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.prospect_request_windows, public.prospect_inbound_receipts TO service_role;

ALTER TABLE public.email_prospects
  ADD COLUMN IF NOT EXISTS qualification_claim_token uuid,
  ADD COLUMN IF NOT EXISTS qualification_claimed_at timestamptz;

CREATE OR REPLACE FUNCTION public.take_prospect_request_slot(p_operation text, p_limit integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE v_count integer;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service authorization required' USING ERRCODE = '42501';
  END IF;
  IF p_operation NOT IN ('inbound_reply', 'qualification') OR p_limit < 1 OR p_limit > 1000 THEN
    RAISE EXCEPTION 'Invalid operation limit';
  END IF;
  INSERT INTO public.prospect_request_windows(operation, window_start, request_count)
  VALUES (p_operation, date_trunc('hour', now()), 1)
  ON CONFLICT (operation) DO UPDATE SET
    request_count = CASE WHEN prospect_request_windows.window_start = date_trunc('hour', now())
      THEN prospect_request_windows.request_count + 1 ELSE 1 END,
    window_start = date_trunc('hour', now())
  RETURNING request_count INTO v_count;
  RETURN v_count <= p_limit;
END $$;

CREATE OR REPLACE FUNCTION public.process_prospect_inbound_reply(
  p_message_id text, p_sender text, p_subject text, p_text text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_inserted integer;
  v_prospect public.email_prospects%ROWTYPE;
  v_lead_id uuid;
  v_new_lead boolean := false;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service authorization required' USING ERRCODE = '42501';
  END IF;
  IF p_message_id IS NULL OR length(p_message_id) NOT BETWEEN 1 AND 256
    OR p_sender IS NULL OR length(p_sender) > 254 OR p_sender !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR p_subject IS NULL OR length(p_subject) > 500 OR p_text IS NULL OR length(p_text) > 16000 THEN
    RAISE EXCEPTION 'Invalid inbound reply';
  END IF;
  -- ON CONFLICT waits for a concurrent same-event transaction. Every write
  -- below rolls back together if any CRM/task/timeline operation fails.
  INSERT INTO public.prospect_inbound_receipts(message_id) VALUES (p_message_id)
    ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN RETURN jsonb_build_object('duplicate', true); END IF;
  IF NOT public.take_prospect_request_slot('inbound_reply', 300) THEN
    DELETE FROM public.prospect_inbound_receipts WHERE message_id = p_message_id;
    RETURN jsonb_build_object('rate_limited', true);
  END IF;
  SELECT * INTO v_prospect FROM public.email_prospects
    WHERE lower(contact_email) = lower(p_sender) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('matched', false); END IF;
  UPDATE public.prospect_campaign_runs SET status = 'replied', stopped_reason = 'inbound reply', completed_at = now()
    WHERE prospect_id = v_prospect.id AND status = 'active';
  v_lead_id := v_prospect.crm_lead_id;
  IF v_lead_id IS NULL THEN
    SELECT id INTO v_lead_id FROM public.leads WHERE lower(email) = lower(p_sender) ORDER BY created_at LIMIT 1;
    IF v_lead_id IS NULL THEN
      INSERT INTO public.leads(name, email, country, source, service, stage, notes, declared_source, declared_source_label)
      VALUES (coalesce(nullif(v_prospect.contact_name, ''), v_prospect.business_name), v_prospect.contact_email,
        v_prospect.country, 'email_outreach', v_prospect.assigned_campaign, 'interested',
        'Reply received through authenticated inbound integration.', 'email_outreach', 'Outbound email reply')
      RETURNING id INTO v_lead_id;
      v_new_lead := true;
    END IF;
  END IF;
  UPDATE public.email_prospects SET status = 'replied', crm_lead_id = v_lead_id WHERE id = v_prospect.id;
  INSERT INTO public.tasks(title, description, priority, due_date, related_lead_id)
  VALUES ('Reply received: ' || left(v_prospect.business_name, 200),
    'Inbound reply from ' || p_sender || E'\nSubject: ' || p_subject || E'\n\n' || left(p_text, 800),
    'high', (current_date + 1), v_lead_id);
  INSERT INTO public.prospect_timeline(prospect_id, event_type, title, detail, payload)
  VALUES (v_prospect.id, 'reply', 'Inbound reply detected', left(coalesce(nullif(p_subject, ''), p_text), 240),
    jsonb_build_object('message_id', p_message_id, 'lead_id', v_lead_id, 'auto', true));
  IF v_new_lead THEN
    INSERT INTO public.prospect_timeline(prospect_id, event_type, title, payload)
    VALUES (v_prospect.id, 'lead_created', 'Moved to CRM', jsonb_build_object('lead_id', v_lead_id, 'auto', true));
  END IF;
  RETURN jsonb_build_object('matched', true);
END $$;

CREATE OR REPLACE FUNCTION public.claim_prospect_qualification(p_prospect_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE v_prospect public.email_prospects%ROWTYPE; v_token uuid := gen_random_uuid();
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service authorization required' USING ERRCODE = '42501';
  END IF;
  -- Match inbound's lock order (rate row before prospect row) to avoid a
  -- concurrent inbound/qualification deadlock. Attempts, not just AI calls,
  -- count against the authorization-scoped automation cap.
  IF NOT public.take_prospect_request_slot('qualification', 120) THEN RETURN jsonb_build_object('rate_limited', true); END IF;
  SELECT * INTO v_prospect FROM public.email_prospects WHERE id = p_prospect_id FOR UPDATE;
  IF NOT FOUND OR v_prospect.qualification_status <> 'pending'
    OR (v_prospect.qualification_claimed_at IS NOT NULL AND v_prospect.qualification_claimed_at > now() - interval '10 minutes') THEN
    RETURN jsonb_build_object('claimed', false);
  END IF;
  UPDATE public.email_prospects SET qualification_claim_token = v_token, qualification_claimed_at = now()
    WHERE id = p_prospect_id;
  RETURN jsonb_build_object('claimed', true, 'claim_token', v_token, 'prospect', to_jsonb(v_prospect));
END $$;

CREATE OR REPLACE FUNCTION public.finish_prospect_qualification(p_prospect_id uuid, p_claim_token uuid, p_result jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_prospect public.email_prospects%ROWTYPE;
  v_campaigns text[];
  v_campaign public.email_prospect_campaign;
  v_decision text := p_result->>'decision';
  v_notes text := left(coalesce(p_result->>'notes', ''), 1200);
  v_confidence numeric;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Service authorization required' USING ERRCODE = '42501';
  END IF;
  IF v_decision IS NULL OR v_decision NOT IN ('qualified', 'needs_review', 'rejected')
    OR jsonb_typeof(p_result->'campaigns') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid qualification result'; END IF;
  SELECT * INTO v_prospect FROM public.email_prospects WHERE id = p_prospect_id
    AND qualification_claim_token = p_claim_token AND qualification_status = 'pending' FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('finished', false); END IF;
  SELECT coalesce(array_agg(DISTINCT value), '{}'::text[]) INTO v_campaigns
  FROM jsonb_array_elements_text(p_result->'campaigns')
  WHERE value IN ('idv_acsp','uk_formation','banking','compliance','ai_dashboard','website_dev')
    AND NOT (v_prospect.has_website AND value = 'website_dev');
  IF v_decision = 'qualified' AND cardinality(v_campaigns) = 0 THEN RAISE EXCEPTION 'A qualified campaign is required'; END IF;
  v_campaign := CASE WHEN v_prospect.assigned_campaign IS NOT NULL THEN v_prospect.assigned_campaign
    WHEN p_result->>'primary' = ANY(v_campaigns) THEN (p_result->>'primary')::public.email_prospect_campaign
    ELSE v_campaigns[1]::public.email_prospect_campaign END;
  v_confidence := greatest(0, least(1, (p_result->>'confidence')::numeric));
  UPDATE public.email_prospects SET qualification_status = v_decision, qualification_confidence = v_confidence,
    ai_notes = v_notes, recommended_campaigns = v_campaigns, qualified_at = coalesce(qualified_at, now()),
    last_qualified_at = now(), qualification_claim_token = NULL, qualification_claimed_at = NULL,
    assigned_campaign = CASE WHEN v_decision = 'qualified' THEN v_campaign ELSE assigned_campaign END,
    -- A reply/unsubscribe/manual stop during AI work must not be re-enrolled.
    status = CASE WHEN status NOT IN ('new','qualified','enrolled') THEN status
      WHEN v_decision = 'qualified' THEN 'enrolled'::public.email_prospect_status
      WHEN v_decision = 'rejected' THEN 'rejected'::public.email_prospect_status ELSE status END
    WHERE id = p_prospect_id;
  INSERT INTO public.prospect_timeline(prospect_id, event_type, title, detail, payload)
  VALUES (p_prospect_id, 'qualified', 'Qualification completed', v_notes,
    jsonb_build_object('decision', v_decision, 'confidence', v_confidence, 'recommended_campaigns', v_campaigns));
  IF v_decision = 'qualified' THEN
    INSERT INTO public.prospect_timeline(prospect_id, event_type, title, payload)
    VALUES (p_prospect_id, 'campaign_selected', 'Campaign selected: ' || v_campaign,
      jsonb_build_object('campaign', v_campaign, 'alternates', v_campaigns));
  END IF;
  RETURN jsonb_build_object('finished', true, 'campaign', CASE WHEN v_decision = 'qualified' THEN v_campaign END);
END $$;

REVOKE ALL ON FUNCTION public.take_prospect_request_slot(text, integer),
  public.process_prospect_inbound_reply(text, text, text, text), public.claim_prospect_qualification(uuid),
  public.finish_prospect_qualification(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.take_prospect_request_slot(text, integer),
  public.process_prospect_inbound_reply(text, text, text, text), public.claim_prospect_qualification(uuid),
  public.finish_prospect_qualification(uuid, uuid, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.trigger_instant_qualification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE v_url text; v_key text;
BEGIN
  IF NEW.qualification_status <> 'pending' THEN RETURN NEW; END IF;
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'prospect_qualification_function_url' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  -- Never send a service credential to an arbitrary URL. Owner must verify that
  -- this allowed Supabase project URL matches the production deployment.
  IF v_url IS NULL OR v_url !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/qualify-prospect-now$' OR nullif(v_key, '') IS NULL THEN
    RAISE WARNING 'Instant qualification not configured; authorized batch fallback remains available';
    RETURN NEW;
  END IF;
  BEGIN
    PERFORM net.http_post(url := v_url,
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_key),
      body := jsonb_build_object('prospect_id', NEW.id));
  EXCEPTION WHEN OTHERS THEN
    -- Do not include provider errors/headers or secrets in PostgreSQL logs.
    RAISE WARNING 'Instant qualification dispatch failed; use authorized batch fallback';
  END;
  RETURN NEW;
END $$;
