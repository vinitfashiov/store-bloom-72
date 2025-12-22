import { Link } from 'react-router-dom';
import { Store, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StoreHeaderProps {
  storeName: string;
  storeSlug: string;
  businessType: 'ecommerce' | 'grocery';
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StoreHeader({
  storeName,
  storeSlug,
  businessType,
  cartCount,
  searchQuery,
  onSearchChange
}: StoreHeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to={`/store/${storeSlug}`} className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-foreground">{storeName}</h1>
              <Badge variant="secondary" className="text-xs">
                {businessType === 'grocery' ? '🍎 Grocery' : '🛒 E-Commerce'}
              </Badge>
            </div>
          </Link>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/store/${storeSlug}/products`}>
              <Button variant="ghost" size="sm">Products</Button>
            </Link>
            <Link to={`/store/${storeSlug}/cart`}>
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
