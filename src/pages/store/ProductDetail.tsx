import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoreHeader } from '@/components/storefront/StoreHeader';
import { StoreFooter } from '@/components/storefront/StoreFooter';
import { useCart } from '@/hooks/useCart';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { toast } from 'sonner';
import { 
  Package, 
  ShoppingCart, 
  Minus, 
  Plus, 
  ChevronLeft,
  Check,
  AlertCircle,
  Heart
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
  has_variants: boolean;
  category: { name: string } | null;
  brand: { name: string } | null;
}

interface Variant {
  id: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock_qty: number;
  is_active: boolean;
  attributes: { attribute_name: string; value: string }[];
}

interface AttributeOption {
  name: string;
  values: string[];
}

export default function ProductDetail() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const { customer } = useStoreAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

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
        .select('*, category:categories(name), brand:brands(name)')
        .eq('tenant_id', tenantData.id)
        .eq('slug', productSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (productData) {
        setProduct(productData as Product);

        // Fetch variants if product has variants
        if (productData.has_variants) {
          const { data: variantsData } = await supabase
            .from('product_variants')
            .select('id, sku, price, compare_at_price, stock_qty, is_active')
            .eq('product_id', productData.id)
            .eq('is_active', true);

          if (variantsData && variantsData.length > 0) {
            // Fetch variant attributes
            const variantIds = variantsData.map(v => v.id);
            const { data: variantAttrsData } = await supabase
              .from('variant_attributes')
              .select('variant_id, attribute:attributes(name), attribute_value:attribute_values(value)')
              .in('variant_id', variantIds);

            // Build variants with attributes
            const variantsWithAttrs = variantsData.map(v => ({
              ...v,
              attributes: (variantAttrsData || [])
                .filter(va => va.variant_id === v.id)
                .map(va => ({
                  attribute_name: (va.attribute as any)?.name || '',
                  value: (va.attribute_value as any)?.value || ''
                }))
            }));

            setVariants(variantsWithAttrs);

            // Build attribute options
            const attrMap: Record<string, Set<string>> = {};
            variantsWithAttrs.forEach(v => {
              v.attributes.forEach(a => {
                if (!attrMap[a.attribute_name]) attrMap[a.attribute_name] = new Set();
                attrMap[a.attribute_name].add(a.value);
              });
            });

            const options = Object.entries(attrMap).map(([name, values]) => ({
              name,
              values: Array.from(values)
            }));

            setAttributeOptions(options);

            // Auto-select first variant
            if (options.length > 0) {
              const initialSelection: Record<string, string> = {};
              options.forEach(opt => {
                initialSelection[opt.name] = opt.values[0];
              });
              setSelectedAttributes(initialSelection);
            }
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [slug, productSlug]);

  // Find matching variant when attributes change
  useEffect(() => {
    if (!product?.has_variants || variants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    const matchingVariant = variants.find(v => {
      return v.attributes.every(a => selectedAttributes[a.attribute_name] === a.value);
    });

    setSelectedVariant(matchingVariant || null);
  }, [selectedAttributes, variants, product?.has_variants]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (!customer || !tenant || !product) return;
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('customer_id', customer.id)
        .eq('product_id', product.id)
        .maybeSingle();
      setIsWishlisted(!!data);
    };
    checkWishlist();
  }, [customer, tenant, product]);

  const handleToggleWishlist = async () => {
    if (!customer || !tenant || !product) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    if (isWishlisted) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('tenant_id', tenant.id)
        .eq('customer_id', customer.id)
        .eq('product_id', product.id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlists').insert({
        tenant_id: tenant.id,
        customer_id: customer.id,
        product_id: product.id
      });
      setIsWishlisted(true);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const price = selectedVariant?.price ?? product.price;
    const stockQty = selectedVariant?.stock_qty ?? product.stock_qty;

    if (stockQty <= 0) {
      toast.error('This item is out of stock');
      return;
    }
    
    setAdding(true);
    // TODO: Pass variant_id to addToCart when adding variant support to cart
    const success = await addToCart(product.id, price, quantity);
    if (success) {
      toast.success(`Added ${quantity} item(s) to cart!`);
    } else {
      toast.error('Failed to add to cart');
    }
    setAdding(false);
  };

  const getImageUrl = (img: string) => {
    if (img.startsWith('http')) return img;
    return supabase.storage.from('product-images').getPublicUrl(img).data.publicUrl;
  };

  // Use variant price/stock if selected, otherwise use product price/stock
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayComparePrice = selectedVariant?.compare_at_price ?? product?.compare_at_price;
  const displayStockQty = selectedVariant?.stock_qty ?? product?.stock_qty ?? 0;

  const discount = displayComparePrice 
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
    : 0;

  const isOutOfStock = displayStockQty <= 0;
  const isLowStock = displayStockQty > 0 && displayStockQty <= 5;

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
            <div className="aspect-square rounded-xl bg-muted overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={getImageUrl(product.images[selectedImage])} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background"
                onClick={handleToggleWishlist}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
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
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.brand && (
              <Badge variant="outline" className="mb-2">{product.brand.name}</Badge>
            )}
            {product.category && (
              <Badge variant="secondary" className="mb-2 ml-2">{product.category.name}</Badge>
            )}
            
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-display font-bold text-primary">
                ₹{displayPrice.toFixed(2)}
              </span>
              {displayComparePrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{displayComparePrice.toFixed(2)}
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
                  <span className="text-sm font-medium">Only {displayStockQty} left!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Variant Selectors */}
            {product.has_variants && attributeOptions.length > 0 && (
              <div className="space-y-4 mb-6">
                {attributeOptions.map(attr => (
                  <div key={attr.name}>
                    <label className="text-sm font-medium mb-2 block">{attr.name}</label>
                    <Select
                      value={selectedAttributes[attr.name] || ''}
                      onValueChange={(value) => setSelectedAttributes(prev => ({ ...prev, [attr.name]: value }))}
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder={`Select ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {attr.values.map(value => (
                          <SelectItem key={value} value={value}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}

            {(selectedVariant?.sku || product.sku) && (
              <p className="text-sm text-muted-foreground mb-6">SKU: {selectedVariant?.sku || product.sku}</p>
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
                  onClick={() => setQuantity(Math.min(displayStockQty, quantity + 1))}
                  disabled={isOutOfStock || quantity >= displayStockQty}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                size="lg" 
                className="flex-1"
                disabled={isOutOfStock || adding || (product.has_variants && !selectedVariant)}
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
        storeSlug={tenant.store_slug}
        address={tenant.address}
        phone={tenant.phone}
      />
    </div>
  );
}
