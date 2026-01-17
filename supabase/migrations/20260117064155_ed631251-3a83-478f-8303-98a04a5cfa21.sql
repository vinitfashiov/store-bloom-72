-- Create a secure view for delivery_boys that excludes sensitive banking and credential columns
-- This can be used for non-admin contexts where full data isn't needed

CREATE VIEW public.delivery_boys_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  tenant_id,
  full_name,
  mobile_number,
  payment_type,
  monthly_salary,
  per_order_amount,
  percentage_value,
  is_active,
  wallet_balance,
  total_earned,
  total_paid,
  created_at,
  updated_at,
  -- Include flags for sensitive data presence without exposing actual values
  CASE WHEN password_hash IS NOT NULL AND password_hash != '' THEN true ELSE false END as has_password,
  CASE WHEN account_number IS NOT NULL AND account_number != '' THEN true ELSE false END as has_bank_account,
  CASE WHEN upi_id IS NOT NULL AND upi_id != '' THEN true ELSE false END as has_upi
FROM public.delivery_boys;

-- Grant SELECT access to authenticated users on the safe view
GRANT SELECT ON public.delivery_boys_safe TO authenticated;

-- Add comment explaining the purpose
COMMENT ON VIEW public.delivery_boys_safe IS 'Safe view of delivery_boys that excludes sensitive banking credentials (account_number, ifsc_code, account_holder_name, upi_id) and password_hash. Use this from client-side code for display purposes.';

-- Verify the delivery_boys table RLS is properly configured
-- The existing policy "Owners can manage delivery boys" restricts all access to tenant owners only
-- This is the correct behavior - no changes needed to the base table policies