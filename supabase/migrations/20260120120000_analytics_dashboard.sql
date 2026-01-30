-- ============================================
-- ANALYTICS & VISITOR TRACKING SYSTEM
-- ============================================

-- 1. Analytics Sessions Table
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  landing_page TEXT,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 1,
  is_bounced BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_tenant_active 
ON public.analytics_sessions(tenant_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_date 
ON public.analytics_sessions(tenant_id, session_start);

-- 2. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name 
ON public.analytics_events(tenant_id, event_name, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners sessions" ON public.analytics_sessions FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Public insert sessions" ON public.analytics_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sessions" ON public.analytics_sessions FOR UPDATE USING (true);

CREATE POLICY "Owners events" ON public.analytics_events FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Public insert events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- 3. Live Visitors RPC
CREATE OR REPLACE FUNCTION get_live_visitors(p_tenant_id UUID)
RETURNS TABLE (count BIGINT, locations JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH active_users AS (
    SELECT country, city, latitude, longitude
    FROM public.analytics_sessions
    WHERE tenant_id = p_tenant_id
      AND last_seen_at > (NOW() - INTERVAL '5 minutes')
  )
  SELECT 
    (SELECT COUNT(*) FROM active_users) as count,
    jsonb_agg(jsonb_build_object('country', country, 'city', city, 'lat', latitude, 'lng', longitude)) as locations
  FROM active_users;
END;
$$;

-- 4. Dashboard Stats RPC
CREATE OR REPLACE FUNCTION get_analytics_dashboard_data(
  p_tenant_id UUID,
  p_date_from TIMESTAMP WITH TIME ZONE,
  p_date_to TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
  v_sales_data JSONB;
  v_sessions_data JSONB;
  v_top_locations JSONB;
  v_device_breakdown JSONB;
BEGIN
  -- Stats
  SELECT jsonb_build_object(
      'total_sessions', COUNT(*),
      'unique_visitors', COUNT(DISTINCT visitor_id),
      'avg_duration', COALESCE(ROUND(AVG(duration_seconds), 1), 0),
      'bounce_rate', COALESCE(ROUND((COUNT(*) FILTER (WHERE is_bounced)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 1), 0)
    ) INTO v_stats
  FROM public.analytics_sessions
  WHERE tenant_id = p_tenant_id AND session_start BETWEEN p_date_from AND p_date_to;

  -- Sales Chart
  SELECT jsonb_agg(jsonb_build_object('date', day, 'sales', COALESCE(sales, 0), 'orders', COALESCE(orders, 0))) INTO v_sales_data
  FROM generate_series(p_date_from::date, p_date_to::date, '1 day'::interval) day
  LEFT JOIN (
    SELECT DATE(created_at) as d, SUM(total) as sales, COUNT(*) as orders
    FROM public.orders
    WHERE tenant_id = p_tenant_id AND status != 'cancelled'
    GROUP BY 1
  ) o ON day = o.d;

  -- Sessions Chart
  SELECT jsonb_agg(jsonb_build_object('date', day, 'sessions', COALESCE(sessions, 0))) INTO v_sessions_data
  FROM generate_series(p_date_from::date, p_date_to::date, '1 day'::interval) day
  LEFT JOIN (
    SELECT DATE(session_start) as d, COUNT(*) as sessions
    FROM public.analytics_sessions
    WHERE tenant_id = p_tenant_id
    GROUP BY 1
  ) s ON day = s.d;

  -- Locations
  SELECT jsonb_agg(t) INTO v_top_locations FROM (
    SELECT country, COUNT(*) as sessions FROM public.analytics_sessions
    WHERE tenant_id = p_tenant_id AND session_start BETWEEN p_date_from AND p_date_to
    GROUP BY country ORDER BY sessions DESC LIMIT 10
  ) t;

  -- Devices
  SELECT jsonb_agg(t) INTO v_device_breakdown FROM (
    SELECT device_type, COUNT(*) as sessions FROM public.analytics_sessions
    WHERE tenant_id = p_tenant_id AND session_start BETWEEN p_date_from AND p_date_to
    GROUP BY device_type
  ) t;

  RETURN jsonb_build_object(
    'stats', v_stats,
    'chart_sales', COALESCE(v_sales_data, '[]'::jsonb),
    'chart_sessions', COALESCE(v_sessions_data, '[]'::jsonb),
    'top_locations', COALESCE(v_top_locations, '[]'::jsonb),
    'device_breakdown', COALESCE(v_device_breakdown, '[]'::jsonb)
  );
END;
$$;
