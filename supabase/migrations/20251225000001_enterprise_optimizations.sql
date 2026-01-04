-- ============================================
-- ENTERPRISE-LEVEL OPTIMIZATIONS
-- For handling lakhs of users and millions of records
-- ============================================

-- ============================================
-- 1. FULL-TEXT SEARCH INDEXES (GIN)
-- ============================================

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Products full-text search
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON public.products USING gin(description gin_trgm_ops) WHERE description IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sku_trgm ON public.products USING gin(sku gin_trgm_ops) WHERE sku IS NOT NULL;

-- Customers full-text search
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm ON public.customers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_email_trgm ON public.customers USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_phone_trgm ON public.customers USING gin(phone gin_trgm_ops) WHERE phone IS NOT NULL;

-- Orders full-text search
CREATE INDEX IF NOT EXISTS idx_orders_order_number_trgm ON public.orders USING gin(order_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name_trgm ON public.orders USING gin(customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone_trgm ON public.orders USING gin(customer_phone gin_trgm_ops);

-- Categories and Brands
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON public.categories USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON public.brands USING gin(name gin_trgm_ops);

-- ============================================
-- 2. MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- Daily sales summary (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales_summary AS
SELECT 
  tenant_id,
  DATE(created_at) as sale_date,
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  SUM(total) as total_revenue,
  SUM(total) FILTER (WHERE status = 'delivered') as delivered_revenue,
  SUM(delivery_fee) as total_delivery_fee,
  AVG(total) as avg_order_value,
  COUNT(DISTINCT customer_id) as unique_customers
FROM public.orders
GROUP BY tenant_id, DATE(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_sales_summary_unique 
ON mv_daily_sales_summary(tenant_id, sale_date);

CREATE INDEX IF NOT EXISTS idx_mv_daily_sales_summary_tenant 
ON mv_daily_sales_summary(tenant_id, sale_date DESC);

-- Product performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_performance AS
SELECT 
  oi.tenant_id,
  oi.product_id,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.qty) as total_quantity_sold,
  SUM(oi.line_total) as total_revenue,
  AVG(oi.unit_price) as avg_selling_price,
  MIN(o.created_at) as first_sale_date,
  MAX(o.created_at) as last_sale_date
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
GROUP BY oi.tenant_id, oi.product_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_product_performance_unique 
ON mv_product_performance(tenant_id, product_id);

CREATE INDEX IF NOT EXISTS idx_mv_product_performance_tenant 
ON mv_product_performance(tenant_id, total_revenue DESC);

-- Customer lifetime value
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_customer_lifetime_value AS
SELECT 
  tenant_id,
  customer_id,
  COUNT(*) as total_orders,
  SUM(total) as lifetime_value,
  AVG(total) as avg_order_value,
  MIN(created_at) as first_order_date,
  MAX(created_at) as last_order_date,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders
FROM public.orders
WHERE customer_id IS NOT NULL
GROUP BY tenant_id, customer_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_customer_lifetime_value_unique 
ON mv_customer_lifetime_value(tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_mv_customer_lifetime_value_tenant 
ON mv_customer_lifetime_value(tenant_id, lifetime_value DESC);

-- ============================================
-- 3. REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ============================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_lifetime_value;
END;
$$;

-- ============================================
-- 4. ARCHIVAL TABLES FOR OLD DATA
-- ============================================

-- Archive old orders (older than 2 years)
CREATE TABLE IF NOT EXISTS public.orders_archive (
  LIKE public.orders INCLUDING ALL
);

-- Archive old order items
CREATE TABLE IF NOT EXISTS public.order_items_archive (
  LIKE public.order_items INCLUDING ALL
);

-- Archive old inventory movements (older than 1 year)
CREATE TABLE IF NOT EXISTS public.inventory_movements_archive (
  LIKE public.inventory_movements INCLUDING ALL
);

-- Indexes for archive tables
CREATE INDEX IF NOT EXISTS idx_orders_archive_tenant_created 
ON public.orders_archive(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_archive_order_id 
ON public.order_items_archive(order_id);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_archive_tenant_created 
ON public.inventory_movements_archive(tenant_id, created_at DESC);

-- ============================================
-- 5. ARCHIVAL FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION archive_old_orders()
RETURNS TABLE(archived_orders bigint, archived_items bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_archived_orders bigint;
  v_archived_items bigint;
BEGIN
  -- Archive orders older than 2 years
  WITH archived AS (
    DELETE FROM public.orders
    WHERE created_at < NOW() - INTERVAL '2 years'
    RETURNING *
  )
  INSERT INTO public.orders_archive
  SELECT * FROM archived;
  
  GET DIAGNOSTICS v_archived_orders = ROW_COUNT;
  
  -- Archive corresponding order items
  WITH archived AS (
    DELETE FROM public.order_items
    WHERE order_id NOT IN (SELECT id FROM public.orders)
    RETURNING *
  )
  INSERT INTO public.order_items_archive
  SELECT * FROM archived;
  
  GET DIAGNOSTICS v_archived_items = ROW_COUNT;
  
  RETURN QUERY SELECT v_archived_orders, v_archived_items;
END;
$$;

-- ============================================
-- 6. ADDITIONAL PERFORMANCE INDEXES
-- ============================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status_created 
ON public.orders(tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_payment_status_created 
ON public.orders(tenant_id, payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_tenant_active_price 
ON public.products(tenant_id, is_active, price) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_tenant_active_stock 
ON public.products(tenant_id, is_active, stock_qty) WHERE is_active = true AND stock_qty > 0;

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product 
ON public.cart_items(cart_id, product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_product 
ON public.order_items(order_id, product_id);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at_brin 
ON public.orders USING brin(created_at);

CREATE INDEX IF NOT EXISTS idx_products_created_at_brin 
ON public.products USING brin(created_at);

-- ============================================
-- 7. QUERY OPTIMIZATION HELPERS
-- ============================================

-- Function to get paginated orders with total count
CREATE OR REPLACE FUNCTION get_paginated_orders(
  p_tenant_id uuid,
  p_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  orders jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count bigint;
  v_orders jsonb;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM public.orders
  WHERE tenant_id = p_tenant_id
    AND (p_status IS NULL OR status = p_status)
    AND (p_payment_status IS NULL OR payment_status = p_payment_status);
  
  -- Get paginated orders
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'order_number', order_number,
      'customer_name', customer_name,
      'total', total,
      'status', status,
      'payment_status', payment_status,
      'created_at', created_at
    ) ORDER BY created_at DESC
  ) INTO v_orders
  FROM public.orders
  WHERE tenant_id = p_tenant_id
    AND (p_status IS NULL OR status = p_status)
    AND (p_payment_status IS NULL OR payment_status = p_payment_status)
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
  
  RETURN QUERY SELECT COALESCE(v_orders, '[]'::jsonb), v_total_count;
END;
$$;

-- Function for full-text product search
CREATE OR REPLACE FUNCTION search_products(
  p_tenant_id uuid,
  p_search_query text,
  p_category_id uuid DEFAULT NULL,
  p_brand_id uuid DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  products jsonb,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count bigint;
  v_products jsonb;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM public.products
  WHERE tenant_id = p_tenant_id
    AND is_active = true
    AND (
      p_search_query IS NULL OR
      name ILIKE '%' || p_search_query || '%' OR
      description ILIKE '%' || p_search_query || '%' OR
      (sku IS NOT NULL AND sku ILIKE '%' || p_search_query || '%')
    )
    AND (p_category_id IS NULL OR category_id = p_category_id)
    AND (p_brand_id IS NULL OR brand_id = p_brand_id)
    AND (p_min_price IS NULL OR price >= p_min_price)
    AND (p_max_price IS NULL OR price <= p_max_price);
  
  -- Get paginated products
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'slug', slug,
      'price', price,
      'compare_at_price', compare_at_price,
      'images', images,
      'stock_qty', stock_qty,
      'has_variants', has_variants
    ) ORDER BY name
  ) INTO v_products
  FROM public.products
  WHERE tenant_id = p_tenant_id
    AND is_active = true
    AND (
      p_search_query IS NULL OR
      name ILIKE '%' || p_search_query || '%' OR
      description ILIKE '%' || p_search_query || '%' OR
      (sku IS NOT NULL AND sku ILIKE '%' || p_search_query || '%')
    )
    AND (p_category_id IS NULL OR category_id = p_category_id)
    AND (p_brand_id IS NULL OR brand_id = p_brand_id)
    AND (p_min_price IS NULL OR price >= p_min_price)
    AND (p_max_price IS NULL OR price <= p_max_price)
  ORDER BY name
  LIMIT p_limit
  OFFSET p_offset;
  
  RETURN QUERY SELECT COALESCE(v_products, '[]'::jsonb), v_total_count;
END;
$$;

-- ============================================
-- 8. PERFORMANCE MONITORING
-- ============================================

-- Table to track slow queries (optional, for monitoring)
CREATE TABLE IF NOT EXISTS public.query_performance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name text NOT NULL,
  execution_time_ms numeric NOT NULL,
  rows_returned integer,
  tenant_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_created 
ON public.query_performance_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_tenant 
ON public.query_performance_log(tenant_id, created_at DESC);

-- ============================================
-- 9. DATABASE MAINTENANCE FUNCTIONS
-- ============================================

-- Function to analyze tables (should be run periodically)
CREATE OR REPLACE FUNCTION analyze_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  ANALYZE public.orders;
  ANALYZE public.products;
  ANALYZE public.customers;
  ANALYZE public.order_items;
  ANALYZE public.cart_items;
  ANALYZE public.inventory_movements;
END;
$$;

-- ============================================
-- 10. OPTIMIZE RLS POLICIES WITH INDEXES
-- ============================================

-- These indexes help RLS policies perform better
-- (Already covered in previous migration, but ensuring they exist)

-- ============================================
-- 11. CONNECTION POOLING CONFIGURATION
-- ============================================

-- Note: Connection pooling is typically configured at the Supabase project level
-- But we can add comments for reference:
COMMENT ON TABLE public.orders IS 'High-traffic table. Use connection pooling for read queries.';
COMMENT ON TABLE public.products IS 'High-traffic table. Consider read replicas for storefront queries.';
COMMENT ON TABLE public.customers IS 'Consider read replicas for customer lookups.';

-- ============================================
-- 12. PARTITIONING STRATEGY (for future)
-- ============================================

-- Note: Table partitioning by date can be implemented when orders table grows very large
-- Example partitioning by month would be:
-- CREATE TABLE orders_2024_01 PARTITION OF orders
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- For now, we'll add a comment suggesting this for future implementation
COMMENT ON TABLE public.orders IS 'Consider partitioning by created_at when table exceeds 10M rows.';

-- ============================================
-- 13. ADDITIONAL INDEXES FOR DELIVERY SYSTEM
-- ============================================

-- Delivery assignments with status and date
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_tenant_status_date 
ON public.delivery_assignments(tenant_id, status, created_at DESC);

-- Delivery earnings by date range
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_created_at_brin 
ON public.delivery_earnings USING brin(created_at);

-- ============================================
-- 14. CART OPTIMIZATION
-- ============================================

-- Index for finding active carts by store
CREATE INDEX IF NOT EXISTS idx_carts_store_slug_status_created 
ON public.carts(store_slug, status, created_at DESC) WHERE status = 'active';

-- ============================================
-- 15. INVENTORY OPTIMIZATION
-- ============================================

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_low_stock 
ON public.products(tenant_id, stock_qty) 
WHERE stock_qty <= low_stock_threshold AND is_active = true;

-- Index for inventory movements by date range
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at_brin 
ON public.inventory_movements USING brin(created_at);

-- ============================================
-- 16. PAYMENT INTENTS OPTIMIZATION
-- ============================================

-- Index for finding pending payments
CREATE INDEX IF NOT EXISTS idx_payment_intents_status_created 
ON public.payment_intents(status, created_at DESC) 
WHERE status IN ('initiated', 'razorpay_order_created');

-- ============================================
-- 17. SCHEDULED JOBS (via pg_cron if available)
-- ============================================

-- Note: These would be set up via Supabase dashboard or pg_cron extension
-- Example cron jobs:
-- 1. Refresh materialized views daily at 2 AM
-- 2. Archive old orders monthly
-- 3. Analyze tables weekly

COMMENT ON FUNCTION refresh_analytics_views() IS 
'Schedule this to run daily via pg_cron: SELECT cron.schedule(''refresh-analytics'', ''0 2 * * *'', $$SELECT refresh_analytics_views()$$);';

COMMENT ON FUNCTION archive_old_orders() IS 
'Schedule this to run monthly via pg_cron: SELECT cron.schedule(''archive-orders'', ''0 3 1 * *'', $$SELECT archive_old_orders()$$);';

COMMENT ON FUNCTION analyze_tables() IS 
'Schedule this to run weekly via pg_cron: SELECT cron.schedule(''analyze-tables'', ''0 4 * * 0'', $$SELECT analyze_tables()$$);';

