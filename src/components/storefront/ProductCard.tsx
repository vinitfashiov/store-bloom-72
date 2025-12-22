import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_qty: number;
  category?: { name: string } | null;
}

interface ProductCardProps {
  product: Product;
  storeSlug: string;
  onAddToCart: (productId: string, price: number) => void;
  isAdding?: boolean;
}

export function ProductCard({ product, storeSlug, onAddToCart, isAdding }: ProductCardProps) {
  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const isOutOfStock = product.stock_qty <= 0;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <Link to={`/store/${storeSlug}/product/${product.slug}`}>
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive">
              -{discount}%
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        {product.category && (
          <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
        )}
        <Link to={`/store/${storeSlug}/product/${product.slug}`}>
          <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-display font-bold text-primary">₹{product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.compare_at_price.toFixed(2)}
            </span>
          )}
        </div>
        <Button 
          size="sm" 
          className="w-full mt-3"
          disabled={isOutOfStock || isAdding}
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product.id, product.price);
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}
