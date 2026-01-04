-- Monitoring and logging tables

-- Application logs table
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  stack TEXT,
  context JSONB,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_logs_tenant ON public.application_logs(tenant_id, created_at DESC) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_application_logs_created ON public.application_logs(created_at DESC);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation TEXT NOT NULL,
  duration_ms NUMERIC NOT NULL,
  metadata JSONB,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation ON public.performance_metrics(operation, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant ON public.performance_metrics(tenant_id, created_at DESC) WHERE tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_performance_metrics_slow ON public.performance_metrics(created_at DESC) WHERE duration_ms > 1000;

-- Enable RLS
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only service role can insert, users can view their own tenant's logs
CREATE POLICY "Service role can insert logs"
ON public.application_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can view their tenant's logs"
ON public.application_logs FOR SELECT
TO authenticated
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Service role can insert metrics"
ON public.performance_metrics FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can view their tenant's metrics"
ON public.performance_metrics FOR SELECT
TO authenticated
USING (tenant_id = get_user_tenant_id());

-- Function to clean up old logs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete logs older than 30 days
  DELETE FROM public.application_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete metrics older than 7 days
  DELETE FROM public.performance_metrics
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Add comments
COMMENT ON TABLE public.application_logs IS 'Application error and info logs';
COMMENT ON TABLE public.performance_metrics IS 'Performance tracking metrics';

