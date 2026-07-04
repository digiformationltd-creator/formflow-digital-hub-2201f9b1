
-- B2B portal ownership: separate the DigiFormation portal user who submitted
-- an order (placed_by_user_id) from the end-customer link (user_id). Portal
-- owners can now place orders for their own clients using any customer email,
-- and those orders remain visible in the placing owner's portal.

ALTER TABLE public.client_orders
  ADD COLUMN IF NOT EXISTS placed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS placed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_client_orders_placed_by ON public.client_orders(placed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_placed_by ON public.invoices(placed_by_user_id);

-- Backfill: for existing orders where user_id is already set, that same user
-- is (by definition of the old anti-spoofing rule) also the portal owner.
UPDATE public.client_orders
   SET placed_by_user_id = user_id
 WHERE placed_by_user_id IS NULL AND user_id IS NOT NULL;

UPDATE public.invoices
   SET placed_by_user_id = user_id
 WHERE placed_by_user_id IS NULL AND user_id IS NOT NULL;

-- Backfill known B2B cases for Hafiz Saad Alam
-- (aralimitedinfo@gmail.com and mahtradersltd@gmail.com are his managed clients).
UPDATE public.client_orders
   SET placed_by_user_id = 'b2fdd18f-e1c1-482f-a9b9-df12289f0797'
 WHERE customer_email ILIKE 'aralimitedinfo@gmail.com'
    OR customer_email ILIKE 'mahtradersltd@gmail.com';

UPDATE public.invoices i
   SET placed_by_user_id = 'b2fdd18f-e1c1-482f-a9b9-df12289f0797'
  FROM public.client_orders o
 WHERE i.order_id = o.id
   AND (o.customer_email ILIKE 'aralimitedinfo@gmail.com'
        OR o.customer_email ILIKE 'mahtradersltd@gmail.com');

-- RLS: portal owners can view every order/invoice they submitted, regardless
-- of the end-customer email on it.
DROP POLICY IF EXISTS "Portal owner views placed orders" ON public.client_orders;
CREATE POLICY "Portal owner views placed orders"
  ON public.client_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = placed_by_user_id);

DROP POLICY IF EXISTS "Portal owner views placed invoices" ON public.invoices;
CREATE POLICY "Portal owner views placed invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = placed_by_user_id);
