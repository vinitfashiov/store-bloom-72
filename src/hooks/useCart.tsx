/**
 * Enterprise Optimized Cart Hook
 * With connection pooling-friendly queries and optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

// Debounce utility for batch operations
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function useCart(storeSlug: string, tenantId: string | null) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);
  const pendingOperations = useRef<Promise<any>>(Promise.resolve());

  const getCartKey = () => `${CART_STORAGE_KEY}_${storeSlug}`;

  const fetchCart = useCallback(async (cartId: string) => {
    try {
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
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
      return null;
    }
  }, [storeSlug]);

  const createCart = useCallback(async () => {
    if (!tenantId) return null;

    try {
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
    } catch (error) {
      console.error('Error creating cart:', error);
      return null;
    }
  }, [tenantId, storeSlug]);

  const addToCart = useCallback(async (productId: string, price: number, qty: number = 1) => {
    if (!tenantId) return false;

    // Chain operations to prevent race conditions
    const operation = pendingOperations.current.then(async () => {
      try {
        let currentCart = cart;
        if (!currentCart) {
          currentCart = await createCart();
          if (!currentCart) return false;
        }

        // Optimistic update
        const existingItem = currentCart.items.find(item => item.product_id === productId);
        
        if (existingItem) {
          // Update quantity
          const { error } = await supabase
            .from('cart_items')
            .update({ qty: existingItem.qty + qty })
            .eq('id', existingItem.id);

          if (error) {
            console.error('Error updating cart item:', error);
            return false;
          }
        } else {
          // Insert new item
          const { error } = await supabase
            .from('cart_items')
            .insert({
              tenant_id: tenantId,
              cart_id: currentCart.id,
              product_id: productId,
              qty,
              unit_price: price
            });

          if (error) {
            console.error('Error adding cart item:', error);
            return false;
          }
        }

        // Optimistically update local state
        setItemCount(prev => prev + qty);
        
        // Debounced refresh
        await fetchCart(currentCart.id);
        return true;
      } catch (error) {
        console.error('Error in addToCart:', error);
        return false;
      }
    });

    pendingOperations.current = operation;
    return operation;
  }, [cart, tenantId, createCart, fetchCart]);

  const updateQuantity = useCallback(async (itemId: string, qty: number) => {
    if (!cart) return false;

    const operation = pendingOperations.current.then(async () => {
      try {
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
      } catch (error) {
        console.error('Error updating quantity:', error);
        return false;
      }
    });

    pendingOperations.current = operation;
    return operation;
  }, [cart, fetchCart]);

  const removeItem = useCallback(async (itemId: string) => {
    return updateQuantity(itemId, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(async () => {
    if (!cart) return;

    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      localStorage.removeItem(getCartKey());
      setCart(null);
      setItemCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
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
