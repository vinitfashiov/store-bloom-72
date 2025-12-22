-- Create payment_intents table for pending Razorpay checkouts
CREATE TABLE public.payment_intents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  store_slug text NOT NULL,
  cart_id uuid NOT NULL REFERENCES public.carts(id),
  draft_order_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'razorpay_order_created', 'paid', 'cancelled', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Public can create payment intents (storefront)
CREATE POLICY "Public can create payment intents"
ON public.payment_intents
FOR INSERT
WITH CHECK (true);

-- Public can update their own payment intents (by id, no auth required for storefront)
CREATE POLICY "Public can update payment intents"
ON public.payment_intents
FOR UPDATE
USING (true);

-- Public can view payment intents
CREATE POLICY "Public can view payment intents"
ON public.payment_intents
FOR SELECT
USING (true);

-- Owners can manage their payment intents
CREATE POLICY "Owners can manage payment intents"
ON public.payment_intents
FOR ALL
USING (tenant_id = get_user_tenant_id())
WITH CHECK (tenant_id = get_user_tenant_id());

-- Add trigger for updated_at
CREATE TRIGGER update_payment_intents_updated_at
BEFORE UPDATE ON public.payment_intents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();