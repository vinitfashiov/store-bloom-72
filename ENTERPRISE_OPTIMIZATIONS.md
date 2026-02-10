# Enterprise-Level Database Optimizations

This document outlines the optimizations implemented for handling lakhs of users and millions of records.

## 🚀 Key Optimizations

### 1. Full-Text Search (GIN Indexes)

- **Products**: Name, description, SKU search
- **Customers**: Name, email, phone search
- **Orders**: Order number, customer name, phone search
- **Categories & Brands**: Name search

**Usage**: Use `ILIKE` or `pg_trgm` similarity functions for fuzzy search.

### 2. Materiali zed Views for Analytics

Three materialized views are created for fast analytics queries:

- **mv_daily_sales_summary**: Daily sales metrics per tenant
- **mv_product_performance**: Product sales performance
- **mv_customer_lifetime_value**: Customer lifetime value metrics

**Refresh**: Run `SELECT refresh_analytics_views();` daily (recommended: 2 AM via pg_cron)

### 3. Archival Strategy

- **Orders Archive**: Orders older than 2 years
- **Order Items Archive**: Corresponding order items
- **Inventory Movements Archive**: Movements older than 1 year

**Archival**: Run `SELECT archive_old_orders();` monthly

### 4. Pagination Functions

Two helper functions for efficient pagination:

#### `get_paginated_orders()`

```sql
SELECT * FROM get_paginated_orders(
  'tenant-uuid',
  'pending',  -- status filter (optional)
  'paid',      -- payment_status filter (optional)
  50,          -- limit
  0            -- offset
);
```

#### `search_products()`

```sql
SELECT * FROM search_products(
  'tenant-uuid',
  'search query',  -- search text (optional)
  'category-uuid', -- category filter (optional)
  'brand-uuid',    -- brand filter (optional)
  0,               -- min_price (optional)
  10000,           -- max_price (optional)
  50,              -- limit
  0                -- offset
);
```

### 5. Performance Indexes

- **Composite indexes** for common query patterns
- **BRIN indexes** for date range queries on large tables
- **Partial indexes** for filtered queries (e.g., active products only)

### 6. Database Maintenance

- **analyze_tables()**: Updates table statistics (run weekly)
- **Query performance logging**: Track slow queries (optional)

## 📊 Recommended Scheduled Jobs

Set up these cron jobs via Supabase Dashboard or pg_cron:

1. **Daily Analytics Refresh** (2 AM)

   ```sql
   SELECT cron.schedule('refresh-analytics', '0 2 * * *',
     $$SELECT refresh_analytics_views()$$);
   ```

2. **Monthly Archival** (1st of month, 3 AM)

   ```sql
   SELECT cron.schedule('archive-orders', '0 3 1 * *',
     $$SELECT archive_old_orders()$$);
   ```

3. **Weekly Table Analysis** (Sunday, 4 AM)
   ```sql
   SELECT cron.schedule('analyze-tables', '0 4 * * 0',
     $$SELECT analyze_tables()$$);
   ```

## 🔧 Frontend Implementation Recommendations

### 1. Implement Pagination

Replace queries that fetch all records with paginated queries:

**Before:**

```typescript
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('tenant_id', tenantId);
```

**After:**

```typescript
const { data, count } = await supabase
  .from('orders')
  .select('*', { count: 'exact' })
  .eq('tenant_id', tenantId)
  .range(offset, offset + limit - 1);
```

### 2. Use Search Functions

For product search, use the `search_products()` function:

```typescript
const { data, error } = await supabase.rpc('search_products', {
  p_tenant_id: tenantId,
  p_search_query: searchQuery,
  p_limit: 50,
  p_offset: 0
});
```

### 3. Cache Analytics Data

Use React Query with appropriate cache times for analytics:

```typescript
const { data } = useQuery({
  queryKey: ['daily-sales', tenantId],
  queryFn: () => supabase.from('mv_daily_sales_summary').select('*').eq('tenant_id', tenantId),
  staleTime: 1000 * 60 * 60, // 1 hour
});
```

### 4. Implement Virtual Scrolling

For large lists (products, orders), use virtual scrolling libraries like `react-window` or `react-virtual`.

## 📈 Monitoring

### Query Performance

Monitor slow queries using the `query_performance_log` table:

```sql
SELECT
  query_name,
  AVG(execution_time_ms) as avg_time,
  MAX(execution_time_ms) as max_time,
  COUNT(*) as execution_count
FROM query_performance_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY query_name
ORDER BY avg_time DESC;
```

### Table Sizes

Monitor table growth:

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🚨 When to Scale Further

### Consider Partitioning When:

- Orders table exceeds **10 million rows**
- Queries on date ranges become slow (>500ms)
- Table size exceeds **50GB**

### Consider Read Replicas When:

- Read queries are >80% of total queries
- Storefront queries are slow during peak hours
- Analytics queries impact production performance

### Consider Sharding When:

- Single tenant has >1 million orders
- Database size exceeds **500GB**
- Need geographic distribution

## 🔐 Security Notes

- All functions use `SECURITY DEFINER` - ensure proper RLS policies
- Archive tables should have same RLS policies as main tables
- Materialized views are public - ensure tenant isolation in queries

## 📝 Next Steps

1. **Run the migration**: Apply both index migrations
2. **Set up cron jobs**: Configure scheduled maintenance
3. **Update frontend**: Implement pagination and use search functions
4. **Monitor**: Track query performance for first week
5. **Optimize**: Adjust based on actual usage patterns

## 🆘 Troubleshooting

### Slow Queries

1. Check if indexes are being used: `EXPLAIN ANALYZE <query>`
2. Update statistics: `SELECT analyze_tables();`
3. Check for missing indexes on frequently queried columns

### Materialized Views Not Updating

- Check cron job status
- Manually refresh: `SELECT refresh_analytics_views();`
- Verify view definitions are correct

### Archive Process Failing

- Check disk space
- Verify archive tables exist
- Check for foreign key constraints blocking deletion
