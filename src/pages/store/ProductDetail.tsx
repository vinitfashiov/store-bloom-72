import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreHeader } from '@/components/storefront/StoreHeader';
import { StoreFooter } from '@/components/storefront/StoreFooter';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { 
  Package, 
  ShoppingCart, 
  Minus, 
  Plus, 
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';

interface Tenant {
  id: string;
  store_name: string;
  store_slug: string;
  business_type: 'ecommerce' | 'grocery';
  address: string | null;
  phone: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  images: string[];
  stock_qty: number;
  category: { name: string } | null;
}

export default function ProductDetail() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { itemCount, addToCart } = useCart(slug || '', tenant?.id || null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !productSlug) return;

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, store_name, store_slug, business_type, address, phone')
        .eq('store_slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (!tenantData) {
        setLoading(false);
        return;
      }

      setTenant(tenantData as Tenant);

      const { data: productData } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .eq('tenant_id', tenantData.id)
        .eq('slug', productSlug)
        .eq('is_active', true)
        .maybeSingle();

      setProduct(productData as Product);
      setLoading(false);
    };

    fetchData();
  }, [slug, productSlug]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAdding(true);
    const success = await addToCart(product.id, product.price, quantity);
    if (success) {
      toast.success(`Added ${quantity} item(s) to cart!`);
    } else {
      toast.error('Failed to add to cart');
    }
    setAdding(false);
  };

  const discount = product?.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const isOutOfStock = product ? product.stock_qty <= 0 : false;
  const isLowStock = product ? product.stock_qty > 0 && product.stock_qty <= 5 : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!tenant || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="py-12">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Product not found</h1>
            <p className="text-muted-foreground mb-4">This product doesn't exist or has been removed.</p>
            <Link to={`/store/${slug}/products`}>
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StoreHeader
        storeName={tenant.store_name}
        storeSlug={tenant.store_slug}
        businessType={tenant.business_type}
        cartCount={itemCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link 
          to={`/store/${slug}/products`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl bg-muted overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <Badge variant="secondary" className="mb-2">{product.category.name}</Badge>
            )}
            
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-display font-bold text-primary">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.compare_at_price.toFixed(2)}
                  </span>
                  <Badge className="bg-destructive">{discount}% OFF</Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Only {product.stock_qty} left!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}

            {product.sku && (
              <p className="text-sm text-muted-foreground mb-6">SKU: {product.sku}</p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                  disabled={isOutOfStock || quantity >= product.stock_qty}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                size="lg" 
                className="flex-1"
                disabled={isOutOfStock || adding}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter
        storeName={tenant.store_name}
        address={tenant.address}
        phone={tenant.phone}
      />
    </div>
  );
}
