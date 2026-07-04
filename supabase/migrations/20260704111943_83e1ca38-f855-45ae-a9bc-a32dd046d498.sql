-- =========================================================
-- Phase 3: B2B managed clients foundation
-- =========================================================

-- 1) managed_clients table
CREATE TABLE public.managed_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  company text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.managed_clients TO authenticated;
GRANT ALL ON public.managed_clients TO service_role;

ALTER TABLE public.managed_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own managed clients"
  ON public.managed_clients FOR SELECT TO authenticated
  USING (auth.uid() = portal_owner_user_id);

CREATE POLICY "Owner can insert own managed clients"
  ON public.managed_clients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = portal_owner_user_id);

CREATE POLICY "Owner can update own managed clients"
  ON public.managed_clients FOR UPDATE TO authenticated
  USING (auth.uid() = portal_owner_user_id)
  WITH CHECK (auth.uid() = portal_owner_user_id);

CREATE POLICY "Owner can delete own managed clients"
  ON public.managed_clients FOR DELETE TO authenticated
  USING (auth.uid() = portal_owner_user_id);

CREATE UNIQUE INDEX managed_clients_owner_email_uidx
  ON public.managed_clients (portal_owner_user_id, lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;

CREATE INDEX managed_clients_owner_idx
  ON public.managed_clients (portal_owner_user_id);

CREATE TRIGGER managed_clients_set_updated_at
  BEFORE UPDATE ON public.managed_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) Link column on client_orders
ALTER TABLE public.client_orders
  ADD COLUMN IF NOT EXISTS managed_client_id uuid
  REFERENCES public.managed_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS client_orders_managed_client_idx
  ON public.client_orders (managed_client_id);

-- 3) Backfill: build managed_clients from existing B2B orders and link them
WITH b2b_groups AS (
  SELECT
    co.placed_by_user_id AS owner_id,
    lower(trim(co.customer_email)) AS email_lc,
    (array_agg(co.customer_name     ORDER BY co.created_at DESC)
       FILTER (WHERE co.customer_name IS NOT NULL AND length(trim(co.customer_name)) > 0))[1]     AS name,
    (array_agg(co.customer_email    ORDER BY co.created_at DESC)
       FILTER (WHERE co.customer_email IS NOT NULL))[1]                                            AS email,
    (array_agg(co.customer_whatsapp ORDER BY co.created_at DESC)
       FILTER (WHERE co.customer_whatsapp IS NOT NULL AND length(trim(co.customer_whatsapp)) > 0))[1] AS phone
  FROM public.client_orders co
  JOIN public.profiles p ON p.user_id = co.placed_by_user_id
  WHERE co.placed_by_user_id IS NOT NULL
    AND co.customer_email IS NOT NULL
    AND length(trim(co.customer_email)) > 0
    AND lower(trim(co.customer_email)) <> lower(trim(COALESCE(p.email, '')))
  GROUP BY co.placed_by_user_id, lower(trim(co.customer_email))
)
INSERT INTO public.managed_clients (portal_owner_user_id, name, email, phone)
SELECT owner_id, name, email, phone
FROM b2b_groups
ON CONFLICT DO NOTHING;

UPDATE public.client_orders co
SET managed_client_id = mc.id
FROM public.managed_clients mc
WHERE co.managed_client_id IS NULL
  AND co.placed_by_user_id IS NOT NULL
  AND co.placed_by_user_id = mc.portal_owner_user_id
  AND co.customer_email IS NOT NULL
  AND mc.email IS NOT NULL
  AND lower(trim(co.customer_email)) = lower(trim(mc.email));

-- 4) Auto-link trigger: attach every new B2B order to a managed_client
CREATE OR REPLACE FUNCTION public.auto_link_b2b_order_to_managed_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner_email text;
  v_customer_email text;
  v_client_id uuid;
BEGIN
  IF NEW.placed_by_user_id IS NULL
     OR NEW.customer_email IS NULL
     OR length(trim(NEW.customer_email)) = 0 THEN
    RETURN NEW;
  END IF;
  IF NEW.managed_client_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT lower(trim(email)) INTO v_owner_email
    FROM public.profiles WHERE user_id = NEW.placed_by_user_id;
  v_customer_email := lower(trim(NEW.customer_email));

  -- Direct order (customer == portal owner): do not create a managed client
  IF v_owner_email IS NOT NULL AND v_customer_email = v_owner_email THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_client_id
  FROM public.managed_clients
  WHERE portal_owner_user_id = NEW.placed_by_user_id
    AND email IS NOT NULL
    AND lower(trim(email)) = v_customer_email
  LIMIT 1;

  IF v_client_id IS NULL THEN
    INSERT INTO public.managed_clients (portal_owner_user_id, name, email, phone)
    VALUES (NEW.placed_by_user_id, NEW.customer_name, NEW.customer_email, NEW.customer_whatsapp)
    RETURNING id INTO v_client_id;
  END IF;

  NEW.managed_client_id := v_client_id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'auto_link_b2b_order_to_managed_client failed: %', SQLERRM;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_auto_link_b2b_order_to_managed_client ON public.client_orders;
CREATE TRIGGER trg_auto_link_b2b_order_to_managed_client
  BEFORE INSERT ON public.client_orders
  FOR EACH ROW EXECUTE FUNCTION public.auto_link_b2b_order_to_managed_client();

-- 5) Merge helper: reassign all orders from source to target, then delete source
CREATE OR REPLACE FUNCTION public.merge_managed_clients(_target uuid, _source uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_target_owner uuid;
  v_source_owner uuid;
  v_moved int;
BEGIN
  IF _target IS NULL OR _source IS NULL OR _target = _source THEN
    RAISE EXCEPTION 'Invalid merge: target and source must be different clients';
  END IF;

  SELECT portal_owner_user_id INTO v_target_owner
    FROM public.managed_clients WHERE id = _target;
  SELECT portal_owner_user_id INTO v_source_owner
    FROM public.managed_clients WHERE id = _source;

  IF v_target_owner IS NULL OR v_source_owner IS NULL THEN
    RAISE EXCEPTION 'Managed client not found';
  END IF;
  IF v_target_owner <> v_source_owner THEN
    RAISE EXCEPTION 'Cannot merge clients across different portal owners';
  END IF;
  IF auth.uid() IS NULL OR auth.uid() <> v_target_owner THEN
    RAISE EXCEPTION 'Not authorized to merge these clients'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  UPDATE public.client_orders
     SET managed_client_id = _target
   WHERE managed_client_id = _source;
  GET DIAGNOSTICS v_moved = ROW_COUNT;

  DELETE FROM public.managed_clients WHERE id = _source;

  RETURN jsonb_build_object('ok', true, 'moved_orders', v_moved);
END $$;

REVOKE ALL ON FUNCTION public.merge_managed_clients(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_managed_clients(uuid, uuid) TO authenticated;