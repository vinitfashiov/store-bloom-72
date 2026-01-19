-- Create a function to aggregate daily analytics
CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_date DATE := CURRENT_DATE - INTERVAL '1 day';
  t RECORD;
BEGIN
  -- Loop through all tenants with session data
  FOR t IN 
    SELECT DISTINCT tenant_id 
    FROM store_sessions 
    WHERE DATE(started_at) = target_date
  LOOP
    INSERT INTO store_analytics_daily (
      tenant_id,
      date,
      total_sessions,
      unique_visitors,
      page_views,
      avg_session_duration_seconds,
      bounce_rate,
      conversion_rate,
      total_orders,
      total_revenue,
      successful_payments,
      failed_payments,
      avg_load_time_ms
    )
    SELECT
      t.tenant_id,
      target_date,
      COUNT(DISTINCT s.session_id) as total_sessions,
      COUNT(DISTINCT s.visitor_id) as unique_visitors,
      COALESCE(SUM(s.page_views), 0) as page_views,
      COALESCE(AVG(s.duration_seconds), 0) as avg_session_duration_seconds,
      CASE 
        WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE s.is_bounce = true)::NUMERIC / COUNT(*)::NUMERIC) * 100
        ELSE 0
      END as bounce_rate,
      CASE 
        WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE s.is_converted = true)::NUMERIC / COUNT(*)::NUMERIC) * 100
        ELSE 0
      END as conversion_rate,
      (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = t.tenant_id AND DATE(o.created_at) = target_date) as total_orders,
      (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.tenant_id = t.tenant_id AND DATE(o.created_at) = target_date AND payment_status = 'paid') as total_revenue,
      (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = t.tenant_id AND DATE(o.created_at) = target_date AND payment_status = 'paid') as successful_payments,
      (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = t.tenant_id AND DATE(o.created_at) = target_date AND payment_status = 'failed') as failed_payments,
      COALESCE((SELECT AVG(load_time_ms) FROM store_page_views pv WHERE pv.tenant_id = t.tenant_id AND DATE(pv.viewed_at) = target_date), 0) as avg_load_time_ms
    FROM store_sessions s
    WHERE s.tenant_id = t.tenant_id
      AND DATE(s.started_at) = target_date
    ON CONFLICT (tenant_id, date) DO UPDATE SET
      total_sessions = EXCLUDED.total_sessions,
      unique_visitors = EXCLUDED.unique_visitors,
      page_views = EXCLUDED.page_views,
      avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
      bounce_rate = EXCLUDED.bounce_rate,
      conversion_rate = EXCLUDED.conversion_rate,
      total_orders = EXCLUDED.total_orders,
      total_revenue = EXCLUDED.total_revenue,
      successful_payments = EXCLUDED.successful_payments,
      failed_payments = EXCLUDED.failed_payments,
      avg_load_time_ms = EXCLUDED.avg_load_time_ms,
      updated_at = now();
  END LOOP;
END;
$$;

-- Also create a function to aggregate current day (for real-time updates)
CREATE OR REPLACE FUNCTION public.refresh_today_analytics(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO store_analytics_daily (
    tenant_id,
    date,
    total_sessions,
    unique_visitors,
    page_views,
    avg_session_duration_seconds,
    bounce_rate,
    conversion_rate,
    total_orders,
    total_revenue,
    successful_payments,
    failed_payments,
    avg_load_time_ms
  )
  SELECT
    p_tenant_id,
    target_date,
    COUNT(DISTINCT s.session_id) as total_sessions,
    COUNT(DISTINCT s.visitor_id) as unique_visitors,
    COALESCE(SUM(s.page_views), 0) as page_views,
    COALESCE(AVG(s.duration_seconds), 0) as avg_session_duration_seconds,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE s.is_bounce = true)::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as bounce_rate,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE s.is_converted = true)::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as conversion_rate,
    (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = p_tenant_id AND DATE(o.created_at) = target_date) as total_orders,
    (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.tenant_id = p_tenant_id AND DATE(o.created_at) = target_date AND payment_status = 'paid') as total_revenue,
    (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = p_tenant_id AND DATE(o.created_at) = target_date AND payment_status = 'paid') as successful_payments,
    (SELECT COUNT(*) FROM orders o WHERE o.tenant_id = p_tenant_id AND DATE(o.created_at) = target_date AND payment_status = 'failed') as failed_payments,
    COALESCE((SELECT AVG(load_time_ms) FROM store_page_views pv WHERE pv.tenant_id = p_tenant_id AND DATE(pv.viewed_at) = target_date), 0) as avg_load_time_ms
  FROM store_sessions s
  WHERE s.tenant_id = p_tenant_id
    AND DATE(s.started_at) = target_date
  ON CONFLICT (tenant_id, date) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    unique_visitors = EXCLUDED.unique_visitors,
    page_views = EXCLUDED.page_views,
    avg_session_duration_seconds = EXCLUDED.avg_session_duration_seconds,
    bounce_rate = EXCLUDED.bounce_rate,
    conversion_rate = EXCLUDED.conversion_rate,
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    successful_payments = EXCLUDED.successful_payments,
    failed_payments = EXCLUDED.failed_payments,
    avg_load_time_ms = EXCLUDED.avg_load_time_ms,
    updated_at = now();
END;
$$;