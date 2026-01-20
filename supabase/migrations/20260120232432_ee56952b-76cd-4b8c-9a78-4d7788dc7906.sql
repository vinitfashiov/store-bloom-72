-- =============================================================================
-- FIX #1-5: Critical Database Fixes - RLS Policies, Atomic COD Order, Indexes
-- =============================================================================

-- ============================================================================
-- FIX #3: Create atomic coupon increment if not exists (for COD path)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = p_coupon_id;
END;
$$;

-- ============================================================================
-- FIX #1 & #8: Atomic Order Creation for COD (with transaction safety)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_tenant_id UUID,
  p_order_number TEXT,
  p_customer_id UUID DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_shipping_address JSONB DEFAULT '{}'::JSONB,
  p_subtotal NUMERIC DEFAULT 0,
  p_discount_total NUMERIC DEFAULT 0,
  p_delivery_fee NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_payment_method TEXT DEFAULT 'cod',
  p_payment_status TEXT DEFAULT 'unpaid',
  p_status TEXT DEFAULT 'pending',
  p_delivery_zone_id UUID DEFAULT NULL,
  p_delivery_slot_id UUID DEFAULT NULL,
  p_delivery_option TEXT DEFAULT 'standard',
  p_coupon_id UUID DEFAULT NULL,
  p_coupon_code TEXT DEFAULT NULL,
  p_razorpay_order_id TEXT DEFAULT NULL,
  p_razorpay_payment_id TEXT DEFAULT NULL,
  p_order_items JSONB DEFAULT '[]'::JSONB,
  p_cart_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_qty INT;
  v_current_stock INT;
BEGIN
  -- Step 1: Check stock availability for all items BEFORE creating order
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty := (v_item->>'qty')::INT;
    
    IF v_variant_id IS NOT NULL THEN
      SELECT stock_qty INTO v_current_stock
      FROM product_variants
      WHERE id = v_variant_id;
      
      IF v_current_stock IS NULL OR v_current_stock < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for variant %', v_variant_id;
      END IF;
    ELSE
      SELECT stock_qty INTO v_current_stock
      FROM products
      WHERE id = v_product_id;
      
      IF v_current_stock IS NULL OR v_current_stock < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
      END IF;
    END IF;
  END LOOP;

  -- Step 2: Create order
  INSERT INTO orders (
    tenant_id, order_number, customer_id, customer_name, customer_phone,
    customer_email, shipping_address, subtotal, discount_total, delivery_fee,
    total, payment_method, payment_status, status, delivery_zone_id,
    delivery_slot_id, delivery_option, coupon_id, coupon_code,
    razorpay_order_id, razorpay_payment_id
  ) VALUES (
    p_tenant_id, p_order_number, p_customer_id, p_customer_name, p_customer_phone,
    p_customer_email, p_shipping_address, p_subtotal, p_discount_total, p_delivery_fee,
    p_total, p_payment_method, p_payment_status, p_status, p_delivery_zone_id,
    p_delivery_slot_id, p_delivery_option, p_coupon_id, p_coupon_code,
    p_razorpay_order_id, p_razorpay_payment_id
  )
  RETURNING id INTO v_order_id;

  -- Step 3: Insert order items and update stock atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty := (v_item->>'qty')::INT;
    
    -- Insert order item
    INSERT INTO order_items (
      tenant_id, order_id, product_id, variant_id, name, qty, unit_price, line_total
    ) VALUES (
      p_tenant_id, v_order_id, v_product_id, v_variant_id,
      COALESCE(v_item->>'name', 'Product'),
      v_qty,
      (v_item->>'unit_price')::NUMERIC,
      COALESCE((v_item->>'line_total')::NUMERIC, (v_item->>'unit_price')::NUMERIC * v_qty)
    );
    
    -- Atomically reduce stock (with check to prevent negative)
    IF v_variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock_qty = stock_qty - v_qty
      WHERE id = v_variant_id AND stock_qty >= v_qty;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to reduce stock for variant %', v_variant_id;
      END IF;
    ELSE
      UPDATE products
      SET stock_qty = stock_qty - v_qty
      WHERE id = v_product_id AND stock_qty >= v_qty;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to reduce stock for product %', v_product_id;
      END IF;
    END IF;
    
    -- Create inventory movement
    INSERT INTO inventory_movements (
      tenant_id, product_id, variant_id, movement_type, quantity,
      reference_type, reference_id, notes
    ) VALUES (
      p_tenant_id, v_product_id, v_variant_id, 'sale', -v_qty,
      'order', v_order_id, 'Order ' || p_order_number
    );
  END LOOP;

  -- Step 4: Update cart status if provided
  IF p_cart_id IS NOT NULL THEN
    UPDATE carts SET status = 'converted' WHERE id = p_cart_id;
  END IF;

  RETURN v_order_id;
END;
$$;

-- ============================================================================
-- FIX #2: Atomic POS Sale Creation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_pos_sale_atomic(
  p_tenant_id UUID,
  p_sale_number TEXT,
  p_customer_id UUID DEFAULT NULL,
  p_customer_name TEXT DEFAULT 'Walk-in Customer',
  p_customer_phone TEXT DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT 0,
  p_discount_amount NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_payment_method TEXT DEFAULT 'cash',
  p_cash_amount NUMERIC DEFAULT NULL,
  p_online_amount NUMERIC DEFAULT NULL,
  p_change_amount NUMERIC DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_qty INT;
  v_current_stock INT;
BEGIN
  -- Step 1: Check stock for all items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantity')::INT;
    
    SELECT stock_qty INTO v_current_stock
    FROM products
    WHERE id = v_product_id;
    
    IF v_current_stock IS NULL OR v_current_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
    END IF;
  END LOOP;

  -- Step 2: Create POS sale
  INSERT INTO pos_sales (
    tenant_id, sale_number, customer_id, customer_name, customer_phone,
    subtotal, discount_amount, total, payment_method,
    cash_amount, online_amount, change_amount
  ) VALUES (
    p_tenant_id, p_sale_number, p_customer_id, p_customer_name, p_customer_phone,
    p_subtotal, p_discount_amount, p_total, p_payment_method,
    p_cash_amount, p_online_amount, p_change_amount
  )
  RETURNING id INTO v_sale_id;

  -- Step 3: Insert sale items and update stock atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantity')::INT;
    
    -- Insert sale item
    INSERT INTO pos_sale_items (
      tenant_id, pos_sale_id, product_id, product_name, quantity,
      unit_price, discount_amount, line_total
    ) VALUES (
      p_tenant_id, v_sale_id, v_product_id,
      v_item->>'name',
      v_qty,
      (v_item->>'price')::NUMERIC,
      COALESCE((v_item->>'discount')::NUMERIC, 0),
      (v_item->>'price')::NUMERIC * v_qty - COALESCE((v_item->>'discount')::NUMERIC, 0)
    );
    
    -- Atomically reduce stock
    UPDATE products
    SET stock_qty = stock_qty - v_qty
    WHERE id = v_product_id AND stock_qty >= v_qty;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Failed to reduce stock for product %', v_product_id;
    END IF;
    
    -- Create inventory movement
    INSERT INTO inventory_movements (
      tenant_id, product_id, variant_id, movement_type, quantity,
      reference_type, reference_id, notes
    ) VALUES (
      p_tenant_id, v_product_id, NULL, 'pos_sale', -v_qty,
      'pos_sale', v_sale_id, 'POS Sale ' || p_sale_number
    );
  END LOOP;

  RETURN v_sale_id;
END;
$$;

-- ============================================================================
-- FIX #4: Tighten RLS Policies - Remove overly permissive ones
-- ============================================================================

-- Fix store_events - require tenant_id validation
DROP POLICY IF EXISTS "Service role can insert events" ON store_events;
CREATE POLICY "Allow insert events with valid tenant"
  ON store_events FOR INSERT
  WITH CHECK (
    tenant_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Fix store_page_views
DROP POLICY IF EXISTS "Service role can insert page views" ON store_page_views;
CREATE POLICY "Allow insert page views with valid tenant"
  ON store_page_views FOR INSERT
  WITH CHECK (
    tenant_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Fix store_performance_metrics
DROP POLICY IF EXISTS "Service role can insert performance metrics" ON store_performance_metrics;
CREATE POLICY "Allow insert performance metrics with valid tenant"
  ON store_performance_metrics FOR INSERT
  WITH CHECK (
    tenant_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Fix store_sessions
DROP POLICY IF EXISTS "Service role can insert sessions" ON store_sessions;
DROP POLICY IF EXISTS "Service role can update sessions" ON store_sessions;

CREATE POLICY "Allow insert sessions with valid tenant"
  ON store_sessions FOR INSERT
  WITH CHECK (
    tenant_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

CREATE POLICY "Allow update own sessions"
  ON store_sessions FOR UPDATE
  USING (
    tenant_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM tenants WHERE id = tenant_id AND is_active = true)
  );

-- Fix tenants INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON tenants;
CREATE POLICY "Authenticated users can create tenants"
  ON tenants FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- ============================================================================
-- FIX #13 & #16: Add missing indexes for performance
-- ============================================================================

-- Index for order date filtering
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(tenant_id, created_at DESC);

-- Index for customer phone lookup
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(tenant_id, phone);

-- Index for cart items lookup
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

-- Index for order number uniqueness check
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(tenant_id, order_number);

-- Index for inventory movements by reference
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);

-- Index for sessions lookup
CREATE INDEX IF NOT EXISTS idx_store_sessions_tenant_started ON store_sessions(tenant_id, started_at DESC);

-- Index for page views lookup
CREATE INDEX IF NOT EXISTS idx_store_page_views_tenant_viewed ON store_page_views(tenant_id, viewed_at DESC);

-- ============================================================================
-- FIX #13: Unique Order Number Generation Function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_unique_order_number(p_tenant_id UUID, p_prefix TEXT DEFAULT 'ORD')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_number TEXT;
  v_counter INT := 0;
BEGIN
  LOOP
    v_order_number := p_prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' || 
                      lpad(floor(random() * 10000)::text, 4, '0');
    
    -- Check if exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE tenant_id = p_tenant_id AND order_number = v_order_number) THEN
      RETURN v_order_number;
    END IF;
    
    v_counter := v_counter + 1;
    IF v_counter > 100 THEN
      -- Fallback to timestamp-based
      RETURN p_prefix || '-' || extract(epoch from now())::bigint::text;
    END IF;
  END LOOP;
END;
$$;