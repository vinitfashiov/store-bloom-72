-- Ensure guest/customer checkout can create orders + order_items without requiring SELECT on orders

-- 1) Replace orders insert policy, scoped to anon+authenticated
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  tenant_id IS NOT NULL
  AND (
    customer_id IS NULL
    OR customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  )
);

-- 2) Helper SECURITY DEFINER function to validate order/tenant without SELECT permission
CREATE OR REPLACE FUNCTION public.order_belongs_to_tenant(_order_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = _order_id
      AND o.tenant_id = _tenant_id
  );
$$;

-- 3) Replace order_items insert policy to avoid SELECT orders under RLS
DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;
CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  tenant_id IS NOT NULL
  AND public.order_belongs_to_tenant(order_id, tenant_id)
);
