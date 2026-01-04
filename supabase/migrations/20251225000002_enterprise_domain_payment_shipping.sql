-- ============================================
-- ENTERPRISE-LEVEL IMPROVEMENTS
-- Domain, Payment, and Shipping Systems
-- ============================================

-- ============================================
-- 1. DOMAIN SYSTEM IMPROVEMENTS
-- ============================================

-- Add domain verification tracking
ALTER TABLE public.custom_domains 
ADD COLUMN IF NOT EXISTS verification_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_verification_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_error TEXT,
ADD COLUMN IF NOT EXISTS ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
ADD COLUMN IF NOT EXISTS ssl_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_verify BOOLEAN NOT NULL DEFAULT false;

-- Domain verification logs
CREATE TABLE IF NOT EXISTS public.domain_verification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES public.custom_domains(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  verified BOOLEAN NOT NULL,
  dns_records JSONB,
  error_message TEXT,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_verification_logs_domain 
ON public.domain_verification_logs(domain_id, verified_at DESC);

CREATE INDEX IF NOT EXISTS idx_domain_verification_logs_tenant 
ON public.domain_verification_logs(tenant_id, verified_at DESC);

-- Enable RLS
ALTER TABLE public.domain_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their domain verification logs"
ON public.domain_verification_logs FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- ============================================
-- 2. PAYMENT SYSTEM IMPROVEMENTS
-- ============================================

-- Payment webhooks table
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  webhook_type TEXT NOT NULL, -- 'payment.captured', 'payment.failed', 'refund.created', etc.
  razorpay_event_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_tenant 
ON public.payment_webhooks(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment_intent 
ON public.payment_webhooks(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_order 
ON public.payment_webhooks(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_razorpay_payment 
ON public.payment_webhooks(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed 
ON public.payment_webhooks(processed, created_at) WHERE processed = false;

-- Payment reconciliation table
CREATE TABLE IF NOT EXISTS public.payment_reconciliation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE SET NULL,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT,
  expected_amount NUMERIC(10,2) NOT NULL,
  received_amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'mismatch', 'resolved')),
  discrepancy_amount NUMERIC(10,2),
  notes TEXT,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_tenant 
ON public.payment_reconciliation(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_order 
ON public.payment_reconciliation(order_id);

CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_status 
ON public.payment_reconciliation(status) WHERE status IN ('pending', 'mismatch');

CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_razorpay_payment 
ON public.payment_reconciliation(razorpay_payment_id);

-- Refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE SET NULL,
  razorpay_refund_id TEXT,
  razorpay_payment_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'processed', 'failed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_tenant 
ON public.refunds(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_refunds_order 
ON public.refunds(order_id);

CREATE INDEX IF NOT EXISTS idx_refunds_status 
ON public.refunds(status) WHERE status IN ('initiated', 'failed');

CREATE INDEX IF NOT EXISTS idx_refunds_razorpay_refund 
ON public.refunds(razorpay_refund_id) WHERE razorpay_refund_id IS NOT NULL;

-- Add refund tracking to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total_refunded NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Owners can view their payment webhooks"
ON public.payment_webhooks FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Owners can view their payment reconciliation"
ON public.payment_reconciliation FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Owners can update payment reconciliation"
ON public.payment_reconciliation FOR UPDATE
USING (tenant_id = get_user_tenant_id())
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Owners can view their refunds"
ON public.refunds FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Owners can create refunds"
ON public.refunds FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Owners can update refunds"
ON public.refunds FOR UPDATE
USING (tenant_id = get_user_tenant_id())
WITH CHECK (tenant_id = get_user_tenant_id());

-- Triggers
CREATE TRIGGER update_payment_reconciliation_updated_at
BEFORE UPDATE ON public.payment_reconciliation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at
BEFORE UPDATE ON public.refunds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. SHIPPING SYSTEM IMPROVEMENTS
-- ============================================

-- Shipping webhooks table
CREATE TABLE IF NOT EXISTS public.shipping_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shiprocket_shipments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  webhook_type TEXT NOT NULL, -- 'shipment.delivered', 'shipment.out_for_delivery', etc.
  shiprocket_event_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_webhooks_tenant 
ON public.shipping_webhooks(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shipping_webhooks_shipment 
ON public.shipping_webhooks(shipment_id) WHERE shipment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shipping_webhooks_order 
ON public.shipping_webhooks(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shipping_webhooks_processed 
ON public.shipping_webhooks(processed, created_at) WHERE processed = false;

-- Shipping tracking updates table
CREATE TABLE IF NOT EXISTS public.shipping_tracking_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  shipment_id UUID NOT NULL REFERENCES public.shiprocket_shipments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  courier_name TEXT,
  awb_code TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_tracking_updates_shipment 
ON public.shipping_tracking_updates(shipment_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_shipping_tracking_updates_order 
ON public.shipping_tracking_updates(order_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_shipping_tracking_updates_tenant 
ON public.shipping_tracking_updates(tenant_id, timestamp DESC);

-- Add tracking fields to shiprocket_shipments
ALTER TABLE public.shiprocket_shipments 
ADD COLUMN IF NOT EXISTS last_tracking_status TEXT,
ADD COLUMN IF NOT EXISTS last_tracking_update_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
ADD COLUMN IF NOT EXISTS current_location TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- Enable RLS
ALTER TABLE public.shipping_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_tracking_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Owners can view their shipping webhooks"
ON public.shipping_webhooks FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Owners can view their shipping tracking updates"
ON public.shipping_tracking_updates FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- ============================================
-- 4. SYSTEM HEALTH MONITORING
-- ============================================

-- System health checks table
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type TEXT NOT NULL, -- 'domain_verification', 'payment_gateway', 'shipping_api'
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_health_checks_type_checked 
ON public.system_health_checks(check_type, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_health_checks_tenant 
ON public.system_health_checks(tenant_id, checked_at DESC) WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_system_health_checks_status 
ON public.system_health_checks(status, checked_at DESC) WHERE status != 'healthy';

-- Enable RLS
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their health checks"
ON public.system_health_checks FOR SELECT
USING (tenant_id = get_user_tenant_id() OR tenant_id IS NULL);

-- ============================================
-- 5. RETRY QUEUE FOR FAILED OPERATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.operation_retry_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL, -- 'domain_verify', 'payment_webhook', 'shipping_webhook', 'tracking_sync'
  operation_id UUID, -- Reference to related record
  payload JSONB NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_error TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operation_retry_queue_tenant 
ON public.operation_retry_queue(tenant_id, next_retry_at);

CREATE INDEX IF NOT EXISTS idx_operation_retry_queue_status 
ON public.operation_retry_queue(status, next_retry_at) WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_operation_retry_queue_type 
ON public.operation_retry_queue(operation_type, next_retry_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.operation_retry_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their retry queue"
ON public.operation_retry_queue FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to schedule retry
CREATE OR REPLACE FUNCTION schedule_operation_retry(
  p_tenant_id UUID,
  p_operation_type TEXT,
  p_operation_id UUID,
  p_payload JSONB,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retry_id UUID;
  v_attempts INTEGER;
  v_next_retry_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if retry already exists
  SELECT id, attempts INTO v_retry_id, v_attempts
  FROM public.operation_retry_queue
  WHERE tenant_id = p_tenant_id
    AND operation_type = p_operation_type
    AND operation_id = p_operation_id
    AND status IN ('pending', 'processing')
  LIMIT 1;

  IF v_retry_id IS NOT NULL THEN
    -- Update existing retry
    v_attempts := v_attempts + 1;
    v_next_retry_at := NOW() + (POWER(2, v_attempts) || ' minutes')::INTERVAL; -- Exponential backoff
    
    UPDATE public.operation_retry_queue
    SET attempts = v_attempts,
        next_retry_at = v_next_retry_at,
        last_error = p_error_message,
        status = CASE WHEN v_attempts >= max_attempts THEN 'failed' ELSE 'pending' END
    WHERE id = v_retry_id;
    
    RETURN v_retry_id;
  ELSE
    -- Create new retry
    v_next_retry_at := NOW() + INTERVAL '5 minutes';
    
    INSERT INTO public.operation_retry_queue (
      tenant_id,
      operation_type,
      operation_id,
      payload,
      next_retry_at,
      last_error
    ) VALUES (
      p_tenant_id,
      p_operation_type,
      p_operation_id,
      p_payload,
      v_next_retry_at,
      p_error_message
    ) RETURNING id INTO v_retry_id;
    
    RETURN v_retry_id;
  END IF;
END;
$$;

-- Function to get pending retries
CREATE OR REPLACE FUNCTION get_pending_retries(
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  id UUID,
  tenant_id UUID,
  operation_type TEXT,
  operation_id UUID,
  payload JSONB,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rq.id,
    rq.tenant_id,
    rq.operation_type,
    rq.operation_id,
    rq.payload,
    rq.attempts
  FROM public.operation_retry_queue rq
  WHERE rq.status = 'pending'
    AND rq.next_retry_at <= NOW()
  ORDER BY rq.next_retry_at ASC
  LIMIT p_limit;
END;
$$;

