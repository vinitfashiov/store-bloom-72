-- Add RLS policy to allow public INSERT on delivery_assignments (for storefront order creation)
CREATE POLICY "Public can create delivery assignments"
ON public.delivery_assignments
FOR INSERT
WITH CHECK (true);

-- Also allow public to view delivery_boys for the delivery panel login
CREATE POLICY "Public can view delivery boys by tenant"
ON public.delivery_boys
FOR SELECT
USING (true);

-- Allow public to view delivery areas for matching pincodes
CREATE POLICY "Public can view delivery areas"
ON public.delivery_areas
FOR SELECT
USING (true);