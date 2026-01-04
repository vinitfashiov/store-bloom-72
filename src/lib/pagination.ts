/**
 * Pagination utilities for enterprise-scale queries
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Calculate offset from page number
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages from total count and limit
 */
export function getTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Create paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = getTotalPages(total, limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Pagination hook helper for Supabase queries
 */
export async function paginatedQuery<T>(
  queryBuilder: {
    select: (columns: string, options?: { count: 'exact' }) => any;
    eq: (column: string, value: any) => any;
    order: (column: string, options?: { ascending?: boolean }) => any;
    range: (from: number, to: number) => any;
  },
  params: PaginationParams,
  filters?: {
    eq?: Array<{ column: string; value: any }>;
    orderBy?: { column: string; ascending?: boolean };
  }
): Promise<PaginatedResponse<T>> {
  const { page, limit } = params;
  const offset = getOffset(page, limit);

  // Apply filters
  let query = queryBuilder.select('*', { count: 'exact' });
  
  if (filters?.eq) {
    filters.eq.forEach(({ column, value }) => {
      query = query.eq(column, value);
    });
  }

  // Apply ordering
  if (filters?.orderBy) {
    query = query.order(filters.orderBy.column, {
      ascending: filters.orderBy.ascending ?? true,
    });
  }

  // Apply pagination
  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  return createPaginatedResponse(
    (data as T[]) || [],
    count || 0,
    page,
    limit
  );
}

/**
 * Use RPC function for complex paginated queries
 */
export async function paginatedRPC<T>(
  supabase: any,
  functionName: string,
  params: PaginationParams & Record<string, any>
): Promise<PaginatedResponse<T>> {
  const { page, limit, ...rpcParams } = params;
  
  const { data, error } = await supabase.rpc(functionName, {
    ...rpcParams,
    p_limit: limit,
    p_offset: getOffset(page, limit),
  });

  if (error) throw error;

  // RPC functions return { data: T[], total_count: number }
  const result = data as { orders?: T[]; products?: T[]; total_count: number };
  const items = result.orders || result.products || [];
  const total = result.total_count || 0;

  return createPaginatedResponse(items as T[], total, page, limit);
}

