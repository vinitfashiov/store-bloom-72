-- Add policy for customers to create orders
CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  tenant_id IS NOT NULL AND
  (
    -- Allow if customer_id matches authenticated user's customer record
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
    OR
    -- Allow guest checkout (no customer_id, but still authenticated or anonymous)
    customer_id IS NULL
  )
);

-- Also add policy for order_items since they're created together
CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  tenant_id IS NOT NULL AND
  order_id IN (
    SELECT id FROM orders WHERE 
      customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
      OR customer_id IS NULL
  )
);