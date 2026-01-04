-- Comprehensive database indexing migration
-- This migration adds indexes for foreign keys, frequently queried columns, and common query patterns

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_payment_id ON public.subscriptions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_tenant_active ON public.categories(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_tenant_category ON public.products(tenant_id, category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON public.products(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tenant_created ON public.products(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_stock_qty ON public.products(stock_qty) WHERE stock_qty > 0;

-- ============================================
-- BRANDS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_brands_tenant_id ON public.brands(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_tenant_active ON public.brands(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(tenant_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);

-- ============================================
-- CARTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_carts_tenant_id ON public.carts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_carts_store_slug ON public.carts(store_slug);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts(status);
CREATE INDEX IF NOT EXISTS idx_carts_tenant_status ON public.carts(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON public.carts(created_at DESC);

-- ============================================
-- CART_ITEMS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cart_items_tenant_id ON public.cart_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id) WHERE variant_id IS NOT NULL;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON public.orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_payment_status ON public.orders(tenant_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON public.orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(tenant_id, order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone_id ON public.orders(delivery_zone_id) WHERE delivery_zone_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_delivery_slot_id ON public.orders(delivery_slot_id) WHERE delivery_slot_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id) WHERE coupon_id IS NOT NULL;

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_order_items_tenant_id ON public.order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id) WHERE variant_id IS NOT NULL;

-- ============================================
-- TENANT_INTEGRATIONS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant_id ON public.tenant_integrations(tenant_id);

-- ============================================
-- PAYMENT_INTENTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_payment_intents_tenant_id ON public.payment_intents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_cart_id ON public.payment_intents(cart_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_razorpay_order_id ON public.payment_intents(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON public.payment_intents(created_at DESC);

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_coupons_tenant_id ON public.coupons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_tenant_active ON public.coupons(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- COUPON_REDEMPTIONS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_tenant_id ON public.coupon_redemptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_order_id ON public.coupon_redemptions(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_customer_id ON public.coupon_redemptions(customer_id) WHERE customer_id IS NOT NULL;

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_wishlists_tenant_id ON public.wishlists(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_customer_product ON public.wishlists(customer_id, product_id);

-- ============================================
-- ATTRIBUTES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attributes_tenant_id ON public.attributes(tenant_id);

-- ============================================
-- ATTRIBUTE_VALUES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_attribute_values_tenant_id ON public.attribute_values(tenant_id);

-- ============================================
-- PRODUCT_VARIANTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_product_variants_tenant_id ON public.product_variants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_tenant_active ON public.product_variants(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku) WHERE sku IS NOT NULL;

-- ============================================
-- VARIANT_ATTRIBUTES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_variant_attributes_attribute_id ON public.variant_attributes(attribute_id);
CREATE INDEX IF NOT EXISTS idx_variant_attributes_attribute_value_id ON public.variant_attributes(attribute_value_id);

-- ============================================
-- CUSTOMER_ADDRESSES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customer_addresses_tenant_id ON public.customer_addresses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON public.customer_addresses(customer_id, is_default) WHERE is_default = true;

-- ============================================
-- DELIVERY_ZONES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_zones_is_active ON public.delivery_zones(is_active) WHERE is_active = true;

-- ============================================
-- DELIVERY_SLOTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_slots_is_active ON public.delivery_slots(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_delivery_slots_tenant_active ON public.delivery_slots(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- TENANT_DELIVERY_SETTINGS TABLE
-- ============================================
-- No additional indexes needed (primary key on tenant_id)

-- ============================================
-- PRODUCT_ZONE_AVAILABILITY TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_product_zone_availability_tenant_id ON public.product_zone_availability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_zone_availability_is_available ON public.product_zone_availability(product_id, is_available) WHERE is_available = true;

-- ============================================
-- SHIPROCKET_SHIPMENTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shiprocket_shipments_tenant_id ON public.shiprocket_shipments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shiprocket_shipments_status ON public.shiprocket_shipments(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shiprocket_shipments_awb_code ON public.shiprocket_shipments(awb_code) WHERE awb_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shiprocket_shipments_created_at ON public.shiprocket_shipments(created_at DESC);

-- ============================================
-- STORE_BANNERS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_store_banners_tenant_id ON public.store_banners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_banners_is_active ON public.store_banners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_store_banners_tenant_active ON public.store_banners(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_store_banners_position ON public.store_banners(tenant_id, position) WHERE is_active = true;

-- ============================================
-- STORE_PAGES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_store_pages_tenant_id ON public.store_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_pages_slug ON public.store_pages(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_store_pages_is_published ON public.store_pages(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_store_pages_tenant_published ON public.store_pages(tenant_id, is_published) WHERE is_published = true;

-- ============================================
-- CUSTOM_DOMAINS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_custom_domains_tenant_id ON public.custom_domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON public.custom_domains(status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_tenant_status ON public.custom_domains(tenant_id, status);

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON public.suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON public.suppliers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_active ON public.suppliers(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- INVENTORY_MOVEMENTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON public.inventory_movements(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON public.inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON public.inventory_movements(reference_type, reference_id) WHERE reference_type IS NOT NULL AND reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_movements_batch_id ON public.inventory_movements(batch_id) WHERE batch_id IS NOT NULL;

-- ============================================
-- PRODUCT_BATCHES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_product_batches_tenant_id ON public.product_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_variant_id ON public.product_batches(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_batches_is_active ON public.product_batches(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_batches_batch_number ON public.product_batches(batch_number) WHERE batch_number IS NOT NULL;

-- ============================================
-- PURCHASE_ORDERS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON public.purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_number ON public.purchase_orders(tenant_id, order_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON public.purchase_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_status ON public.purchase_orders(tenant_id, status);

-- ============================================
-- PURCHASE_ORDER_ITEMS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_tenant_id ON public.purchase_order_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON public.purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_variant_id ON public.purchase_order_items(variant_id) WHERE variant_id IS NOT NULL;

-- ============================================
-- POS_SESSIONS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pos_sessions_tenant_id ON public.pos_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_opened_by ON public.pos_sessions(opened_by);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON public.pos_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_tenant_status ON public.pos_sessions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_opened_at ON public.pos_sessions(opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_tenant_opened ON public.pos_sessions(tenant_id, opened_at DESC);

-- ============================================
-- POS_SALES TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pos_sales_tenant_id ON public.pos_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_sales_session_id ON public.pos_sales(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pos_sales_customer_id ON public.pos_sales(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pos_sales_status ON public.pos_sales(status);
CREATE INDEX IF NOT EXISTS idx_pos_sales_sale_number ON public.pos_sales(tenant_id, sale_number);
CREATE INDEX IF NOT EXISTS idx_pos_sales_created_at ON public.pos_sales(created_at DESC);

-- ============================================
-- POS_SALE_ITEMS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_tenant_id ON public.pos_sale_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_product_id ON public.pos_sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_variant_id ON public.pos_sale_items(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_batch_id ON public.pos_sale_items(batch_id) WHERE batch_id IS NOT NULL;

-- ============================================
-- INVENTORY_SETTINGS TABLE
-- ============================================
-- No additional indexes needed (primary key on tenant_id)

-- ============================================
-- DELIVERY_BOYS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_boys_is_active ON public.delivery_boys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_delivery_boys_tenant_active ON public.delivery_boys(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- DELIVERY_AREAS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_areas_is_active ON public.delivery_areas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_delivery_areas_tenant_active ON public.delivery_areas(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- DELIVERY_BOY_AREAS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_boy_areas_tenant_id ON public.delivery_boy_areas(tenant_id);

-- ============================================
-- DELIVERY_ASSIGNMENTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_delivery_area_id ON public.delivery_assignments(delivery_area_id) WHERE delivery_area_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_created_at ON public.delivery_assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_assigned_at ON public.delivery_assignments(assigned_at) WHERE assigned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_delivered_at ON public.delivery_assignments(delivered_at) WHERE delivered_at IS NOT NULL;

-- ============================================
-- DELIVERY_STATUS_LOGS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_status_logs_tenant_id ON public.delivery_status_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_logs_delivery_boy_id ON public.delivery_status_logs(delivery_boy_id) WHERE delivery_boy_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_status_logs_created_at ON public.delivery_status_logs(created_at DESC);

-- ============================================
-- DELIVERY_EARNINGS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_tenant_id ON public.delivery_earnings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_assignment_id ON public.delivery_earnings(assignment_id) WHERE assignment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_order_id ON public.delivery_earnings(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_earning_type ON public.delivery_earnings(earning_type);
CREATE INDEX IF NOT EXISTS idx_delivery_earnings_created_at ON public.delivery_earnings(created_at DESC);

-- ============================================
-- DELIVERY_PAYOUT_REQUESTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_payout_requests_created_at ON public.delivery_payout_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_payout_requests_processed_at ON public.delivery_payout_requests(processed_at) WHERE processed_at IS NOT NULL;

-- ============================================
-- DELIVERY_PAYOUTS TABLE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_delivery_payouts_tenant_id ON public.delivery_payouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_payouts_payout_request_id ON public.delivery_payouts(payout_request_id) WHERE payout_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_payouts_paid_at ON public.delivery_payouts(paid_at DESC);

-- ============================================
-- TENANTS TABLE (for store_slug lookups)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tenants_store_slug ON public.tenants(store_slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON public.tenants(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tenants_store_slug_active ON public.tenants(store_slug, is_active) WHERE is_active = true;

