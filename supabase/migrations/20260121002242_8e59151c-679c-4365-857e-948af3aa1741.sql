-- Drop the overly restrictive policy and create a proper one for authenticated users
DROP POLICY IF EXISTS "Authenticated users can create carts" ON public.carts;

-- Create a policy that allows any authenticated user to create a cart with a valid tenant_id
CREATE POLICY "Any authenticated user can create carts"
ON public.carts
FOR INSERT
WITH CHECK (
  tenant_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM tenants 
    WHERE tenants.id = tenant_id 
    AND tenants.is_active = true
  )
);