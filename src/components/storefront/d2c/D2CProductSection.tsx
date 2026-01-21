import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { D2CProductCard } from './D2CProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock_qty: number;
  has_variants?: boolean;
  total_variant_stock?: number;
  category?: { name: string } | null;
  brand?: { name: string } | null;
}

interface D2CProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  storeSlug: string;
  onAddToCart: (productId: string, price: number, quantity: number) => void;
  addingProductId?: string | null;
  viewAllLink?: string;
  columns?: 2 | 3 | 4 | 5;
  variant?: 'default' | 'featured';
}

export function D2CProductSection({
  title,
  subtitle,
  products,
  storeSlug,
  onAddToCart,
  addingProductId,
  viewAllLink,
  columns = 4,
  variant = 'default'
}: D2CProductSectionProps) {
  if (products.length === 0) return null;

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5'
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 lg:mb-14">
          <div>
            <h2 className="text-2xl lg:text-3xl font-light tracking-wide text-neutral-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-neutral-500 font-light max-w-lg">
                {subtitle}
              </p>
            )}
          </div>
          
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="hidden lg:inline-flex items-center gap-2 text-sm tracking-wide text-neutral-600 hover:text-neutral-900 transition-colors mt-4 lg:mt-0"
            >
              VIEW ALL
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid ${gridCols[columns]} gap-4 lg:gap-6`}>
          {products.map((product) => (
            <D2CProductCard
              key={product.id}
              product={product}
              storeSlug={storeSlug}
              onAddToCart={onAddToCart}
              isAdding={addingProductId === product.id}
              variant={variant === 'featured' ? 'featured' : 'default'}
            />
          ))}
        </div>

        {/* Mobile View All */}
        {viewAllLink && (
          <div className="lg:hidden text-center mt-10">
            <Link 
              to={viewAllLink}
              className="inline-flex items-center gap-2 px-8 py-3 border border-neutral-900 text-sm tracking-wide hover:bg-neutral-900 hover:text-white transition-colors"
            >
              VIEW ALL
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
