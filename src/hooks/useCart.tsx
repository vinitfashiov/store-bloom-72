import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface CartItem {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Json;
    stock_qty: number;
  } | null;
}

interface Cart {
  id: string;
  tenant_id: string;
  store_slug: string;
  status: string;
  items: CartItem[];
}

const CART_STORAGE_KEY = 'store_cart_id';

export function useCart(storeSlug: string, tenantId: string | null) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);

  const getCartKey = () => `${CART_STORAGE_KEY}_${storeSlug}`;

  const fetchCart = useCallback(async (cartId: string) => {
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('status', 'active')
      .maybeSingle();

    if (cartError || !cartData) {
      localStorage.removeItem(getCartKey());
      setCart(null);
      setItemCount(0);
      setLoading(false);
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, slug, price, images, stock_qty)
      `)
      .eq('cart_id', cartId);

    const cartWithItems: Cart = {
      ...cartData,
      items: items || []
    };

    setCart(cartWithItems);
    setItemCount(items?.reduce((sum, item) => sum + item.qty, 0) || 0);
    setLoading(false);
    return cartWithItems;
  }, [storeSlug]);

  const createCart = useCallback(async () => {
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from('carts')
      .insert({
        tenant_id: tenantId,
        store_slug: storeSlug,
        status: 'active'
      })
      .select()
      .single();

    if (error || !data) return null;

    localStorage.setItem(getCartKey(), data.id);
    const newCart: Cart = { ...data, items: [] };
    setCart(newCart);
    return newCart;
  }, [tenantId, storeSlug]);

  const addToCart = useCallback(async (productId: string, price: number, qty: number = 1) => {
    if (!tenantId) return false;

    let currentCart = cart;
    if (!currentCart) {
      currentCart = await createCart();
      if (!currentCart) return false;
    }

    // Check if item already exists
    const existingItem = currentCart.items.find(item => item.product_id === productId);

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty: existingItem.qty + qty })
        .eq('id', existingItem.id);

      if (error) return false;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          tenant_id: tenantId,
          cart_id: currentCart.id,
          product_id: productId,
          qty,
          unit_price: price
        });

      if (error) return false;
    }

    await fetchCart(currentCart.id);
    return true;
  }, [cart, tenantId, createCart, fetchCart]);

  const updateQuantity = useCallback(async (itemId: string, qty: number) => {
    if (!cart) return false;

    if (qty <= 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) return false;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty })
        .eq('id', itemId);

      if (error) return false;
    }

    await fetchCart(cart.id);
    return true;
  }, [cart, fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    return updateQuantity(itemId, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(async () => {
    if (!cart) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    localStorage.removeItem(getCartKey());
    setCart(null);
    setItemCount(0);
  }, [cart, storeSlug]);

  const getSubtotal = useCallback(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);
  }, [cart]);

  useEffect(() => {
    const savedCartId = localStorage.getItem(getCartKey());
    if (savedCartId && tenantId) {
      fetchCart(savedCartId);
    } else {
      setLoading(false);
    }
  }, [storeSlug, tenantId, fetchCart]);

  return {
    cart,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    refreshCart: () => cart?.id ? fetchCart(cart.id) : Promise.resolve(null)
  };
}
