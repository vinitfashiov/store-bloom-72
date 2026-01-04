-- ============================================
-- ATOMIC ORDER CREATION FUNCTION
-- Optimized for high-volume order processing
-- Prevents race conditions and ensures data consistency
-- ============================================

-- Function to create order atomically with stock updates
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_tenant_id UUID,
  p_order_number TEXT,
  p_customer_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_shipping_address JSONB,
  p_subtotal NUMERIC,
  p_discount_total NUMERIC,
  p_delivery_fee NUMERIC,
  p_total NUMERIC,
  p_payment_method TEXT,
  p_payment_status TEXT,
  p_status TEXT,
  p_delivery_zone_id UUID,
  p_delivery_slot_id UUID,
  p_delivery_option TEXT,
  p_coupon_id UUID,
  p_coupon_code TEXT,
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_order_items JSONB,
  p_cart_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_qty INTEGER;
  v_new_stock INTEGER;
  v_order_items_array JSONB[];
  v_inventory_movements JSONB[];
BEGIN
  -- Validate input
  IF p_order_items IS NULL OR jsonb_array_length(p_order_items) = 0 THEN
    RAISE EXCEPTION 'Order must have at least one item';
  END IF;
  
  -- Start transaction (implicit in function)
  
  -- Create order
  INSERT INTO public.orders (
    tenant_id, order_number, customer_id, customer_name, customer_phone, customer_email,
    shipping_address, subtotal, discount_total, delivery_fee, total,
    payment_method, payment_status, status,
    delivery_zone_id, delivery_slot_id, delivery_option,
    coupon_id, coupon_code, razorpay_order_id, razorpay_payment_id
  ) VALUES (
    p_tenant_id, p_order_number, p_customer_id, p_customer_name, p_customer_phone, p_customer_email,
    p_shipping_address, p_subtotal, p_discount_total, p_delivery_fee, p_total,
    p_payment_method, p_payment_status, p_status,
    p_delivery_zone_id, p_delivery_slot_id, p_delivery_option,
    p_coupon_id, p_coupon_code, p_razorpay_order_id, p_razorpay_payment_id
  ) RETURNING id INTO v_order_id;
  
  -- Prepare batch arrays for order items and inventory movements
  v_order_items_array := ARRAY[]::JSONB[];
  v_inventory_movements := ARRAY[]::JSONB[];
  
  -- Process order items and validate stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty := (v_item->>'qty')::INTEGER;
    
    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Order item quantity must be greater than 0';
    END IF;
    
    -- Check and update stock atomically
    IF v_variant_id IS NOT NULL THEN
      -- Update variant stock atomically (prevents race conditions)
      UPDATE public.product_variants
      SET stock_qty = stock_qty - v_qty,
          updated_at = NOW()
      WHERE id = v_variant_id 
        AND stock_qty >= v_qty
        AND is_active = true
      RETURNING stock_qty INTO v_new_stock;
      
      IF v_new_stock IS NULL THEN
        RAISE EXCEPTION 'Insufficient stock for variant % (product_id: %)', v_variant_id, v_product_id;
      END IF;
    ELSE
      -- Update product stock atomically
      UPDATE public.products
      SET stock_qty = stock_qty - v_qty,
          updated_at = NOW()
      WHERE id = v_product_id 
        AND stock_qty >= v_qty
        AND is_active = true
      RETURNING stock_qty INTO v_new_stock;
      
      IF v_new_stock IS NULL THEN
        RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
      END IF;
    END IF;
    
    -- Prepare order item for batch insert
    v_order_items_array := array_append(v_order_items_array, jsonb_build_object(
      'tenant_id', p_tenant_id,
      'order_id', v_order_id,
      'product_id', v_product_id,
      'variant_id', v_variant_id,
      'name', v_item->>'name',
      'qty', v_qty,
      'unit_price', (v_item->>'unit_price')::NUMERIC,
      'line_total', (v_item->>'line_total')::NUMERIC
    ));
    
    -- Prepare inventory movement for batch insert
    v_inventory_movements := array_append(v_inventory_movements, jsonb_build_object(
      'tenant_id', p_tenant_id,
      'product_id', v_product_id,
      'variant_id', v_variant_id,
      'movement_type', 'sale',
      'quantity', -v_qty,
      'reference_type', 'order',
      'reference_id', v_order_id,
      'notes', 'Online order ' || p_order_number
    ));
  END LOOP;
  
  -- Batch insert order items (single query)
  INSERT INTO public.order_items (
    tenant_id, order_id, product_id, variant_id,
    name, qty, unit_price, line_total
  )
  SELECT 
    (item->>'tenant_id')::UUID,
    (item->>'order_id')::UUID,
    (item->>'product_id')::UUID,
    NULLIF(item->>'variant_id', 'null')::UUID,
    item->>'name',
    (item->>'qty')::INTEGER,
    (item->>'unit_price')::NUMERIC,
    (item->>'line_total')::NUMERIC
  FROM unnest(v_order_items_array) AS item;
  
  -- Batch insert inventory movements (single query)
  INSERT INTO public.inventory_movements (
    tenant_id, product_id, variant_id,
    movement_type, quantity, reference_type, reference_id,
    notes
  )
  SELECT 
    (mov->>'tenant_id')::UUID,
    (mov->>'product_id')::UUID,
    NULLIF(mov->>'variant_id', 'null')::UUID,
    mov->>'movement_type',
    (mov->>'quantity')::INTEGER,
    mov->>'reference_type',
    (mov->>'reference_id')::UUID,
    mov->>'notes'
  FROM unnest(v_inventory_movements) AS mov;
  
  -- Mark cart as converted
  IF p_cart_id IS NOT NULL THEN
    UPDATE public.carts
    SET status = 'converted',
        updated_at = NOW()
    WHERE id = p_cart_id;
  END IF;
  
  -- Return order ID
  RETURN v_order_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback is automatic in function
    RAISE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_order_atomic TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION create_order_atomic IS 'Atomically creates an order with all items, updates stock, and creates inventory movements in a single transaction. Prevents race conditions and ensures data consistency.';

-- ============================================
-- COUPON USAGE INCREMENT FUNCTION
-- ============================================

-- Function to atomically increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = p_coupon_id
    AND is_active = true;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_coupon_usage TO authenticated, anon;

COMMENT ON FUNCTION increment_coupon_usage IS 'Atomically increments coupon usage count. Safe for concurrent access.';

-- ============================================
-- ATOMIC STOCK UPDATE FUNCTION
-- For POS and other operations that need atomic stock updates
-- ============================================

-- Function to atomically update product stock
CREATE OR REPLACE FUNCTION update_product_stock_atomic(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_stock INTEGER;
BEGIN
  -- Atomic stock update (prevents race conditions)
  UPDATE public.products
  SET stock_qty = stock_qty + p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id
    AND (p_quantity > 0 OR stock_qty >= ABS(p_quantity))
    AND is_active = true
  RETURNING stock_qty INTO v_new_stock;
  
  IF v_new_stock IS NULL THEN
    RAISE EXCEPTION 'Insufficient stock for product % or product not found', p_product_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_product_stock_atomic TO authenticated, anon;

COMMENT ON FUNCTION update_product_stock_atomic IS 'Atomically updates product stock. Prevents race conditions. Returns error if insufficient stock.';

-- ============================================
-- PERFORMANCE INDEXES FOR STOCK UPDATES
-- ============================================

-- Index for atomic stock updates (optimizes WHERE clause in UPDATE)
CREATE INDEX IF NOT EXISTS idx_products_stock_check 
ON public.products(id, stock_qty, is_active) 
WHERE stock_qty > 0 AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_product_variants_stock_check 
ON public.product_variants(id, stock_qty, is_active) 
WHERE stock_qty > 0 AND is_active = true;

-- Index for order lookup by number (for confirmation pages)
CREATE INDEX IF NOT EXISTS idx_orders_number_tenant 
ON public.orders(tenant_id, order_number);

-- Index for inventory movements by order (for reporting)
CREATE INDEX IF NOT EXISTS idx_inventory_movements_order 
ON public.inventory_movements(reference_type, reference_id, created_at DESC) 
WHERE reference_type = 'order';

-- Index for cart lookup during checkout
CREATE INDEX IF NOT EXISTS idx_carts_id_status 
ON public.carts(id, status) 
WHERE status = 'active';
