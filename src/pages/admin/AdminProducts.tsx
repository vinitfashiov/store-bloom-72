import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Package, Search, RefreshCw } from 'lucide-react';
import { useAdminProducts, useToggleProductStatus } from '@/hooks/useOptimizedQueries';
import { PaginationControls, usePagination } from '@/components/ui/pagination-controls';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface AdminProductsProps {
  tenantId: string;
  disabled?: boolean;
}

export default function AdminProducts({ tenantId, disabled }: AdminProductsProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { page, pageSize, setPage, setPageSize } = usePagination(1, 25);
  const prevTenantIdRef = useRef(tenantId);

  // Preserve page state when tenant changes (don't reset to page 1)
  useEffect(() => {
    if (prevTenantIdRef.current !== tenantId) {
      prevTenantIdRef.current = tenantId;
      // Don't reset page - keep current page number
    }
  }, [tenantId]);

  const { data, isLoading, isFetching, refetch } = useAdminProducts({
    tenantId,
    search: debouncedSearch || undefined,
    page,
    limit: pageSize,
  });

  const toggleStatus = useToggleProductStatus();

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  // Debounce search
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const toggleActive = async (product: any) => {
    if (disabled) return;
    try {
      await toggleStatus.mutateAsync({ productId: product.id, isActive: !product.is_active });
      toast.success(product.is_active ? 'Product deactivated' : 'Product activated');
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const getImageUrl = (images: string[] | null) => {
    if (!images || images.length === 0) return null;
    const img = images[0];
    if (img.startsWith('http')) return img;
    return supabase.storage.from('product-images').getPublicUrl(img).data.publicUrl;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory
            {totalItems > 0 && <span className="ml-1">({totalItems.toLocaleString()} products)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate('/dashboard/products/new')} disabled={disabled}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/dashboard/products/new')}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => {
                      const imgUrl = getImageUrl(product.images);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden flex items-center justify-center">
                                {imgUrl ? (
                                  <img src={imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                          <TableCell>
                            {product.has_variants ? (
                              <Badge variant="outline">Variants</Badge>
                            ) : (
                              <span className={product.stock_qty <= 0 ? 'text-destructive' : ''}>
                                {product.stock_qty}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {product.category?.name || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.is_active ? 'default' : 'secondary'}
                              className="cursor-pointer"
                              onClick={() => toggleActive(product)}
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(`/dashboard/products/${product.id}`)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="p-4 border-t">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[25, 50, 100]}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
