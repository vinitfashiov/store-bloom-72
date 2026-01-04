/**
 * Example: How to implement pagination in AdminOrders component
 * 
 * This shows the pattern for converting existing queries to paginated queries
 * for enterprise-scale performance.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { paginatedQuery, createPaginatedResponse, PaginatedResponse } from './pagination';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

// Example 1: Using paginatedQuery helper
export function AdminOrdersPaginatedExample({ tenantId }: { tenantId: string }) {
  const [orders, setOrders] = useState<PaginatedResponse<Order>>({
    data: [],
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const result = await paginatedQuery<Order>(
          supabase.from('orders'),
          { page: orders.page, limit: orders.limit },
          {
            eq: [
              { column: 'tenant_id', value: tenantId },
              ...(statusFilter !== 'all' ? [{ column: 'status', value: statusFilter }] : []),
              ...(paymentFilter !== 'all' ? [{ column: 'payment_status', value: paymentFilter }] : []),
            ],
            orderBy: { column: 'created_at', ascending: false },
          }
        );
        setOrders(result);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tenantId, statusFilter, paymentFilter, orders.page]);

  return (
    <div>
      {/* Your table component here */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {orders.data.length} of {orders.total} orders
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!orders.hasPrev || loading}
            onClick={() => setOrders({ ...orders, page: orders.page - 1 })}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">
            Page {orders.page} of {orders.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!orders.hasNext || loading}
            onClick={() => setOrders({ ...orders, page: orders.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Example 2: Using RPC function for complex queries
export function AdminOrdersRPCExample({ tenantId }: { tenantId: string }) {
  const [orders, setOrders] = useState<PaginatedResponse<Order>>({
    data: [],
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { paginatedRPC } = await import('./pagination');
        const result = await paginatedRPC<Order>(
          supabase,
          'get_paginated_orders',
          {
            p_tenant_id: tenantId,
            p_status: statusFilter,
            p_payment_status: paymentFilter,
            page: orders.page,
            limit: orders.limit,
          }
        );
        setOrders(result);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [tenantId, statusFilter, paymentFilter, orders.page]);

  return (
    <div>
      {/* Your table component here */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {orders.data.length} of {orders.total} orders
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!orders.hasPrev || loading}
            onClick={() => setOrders({ ...orders, page: orders.page - 1 })}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">
            Page {orders.page} of {orders.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!orders.hasNext || loading}
            onClick={() => setOrders({ ...orders, page: orders.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Example 3: Manual pagination (if you need more control)
export function AdminOrdersManualExample({ tenantId }: { tenantId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error:', error);
      } else {
        setOrders(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [tenantId, page, limit]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <div>
      {/* Your table component here */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {orders.length} of {total} orders
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!hasPrev || loading} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" disabled={!hasNext || loading} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

