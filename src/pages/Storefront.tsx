import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  ShoppingCart, 
  MapPin, 
  Phone, 
  ArrowRight,
  Package,
  Truck,
  Shield,
  Clock
} from 'lucide-react';

interface Tenant {
  id: string;
  store_name: string;
  store_slug: string;
  business_type: 'ecommerce' | 'grocery';
  plan: 'trial' | 'pro';
  trial_ends_at: string;
  is_active: boolean;
  address: string | null;
  phone: string | null;
}

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      if (!slug) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('store_slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        setError('Failed to load store');
      } else if (!data) {
        setError('Store not found');
      } else {
        // Check if trial has expired
        const trialEnd = new Date(data.trial_ends_at);
        const now = new Date();
        
        if (data.plan === 'trial' && trialEnd < now) {
          setError('This store is currently unavailable');
        } else {
          setTenant(data as Tenant);
        }
      }
      
      setLoading(false);
    };

    fetchTenant();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">{error || 'Store not found'}</h1>
            <p className="text-muted-foreground mb-6">
              The store you're looking for doesn't exist or is currently unavailable.
            </p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">{tenant.store_name}</h1>
                <Badge variant="secondary" className="mt-1">
                  {tenant.business_type === 'grocery' ? '🍎 Grocery' : '🛒 E-Commerce'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart (0)
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 animate-fade-in">
            Welcome to {tenant.store_name}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
            {tenant.business_type === 'grocery' 
              ? 'Fresh groceries and essentials delivered to your door'
              : 'Discover amazing products at great prices'
            }
          </p>
          <Button size="lg" className="shadow-glow animate-scale-in">
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center animate-slide-up" style={{ animationDelay: '0ms' }}>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Quality Products</h3>
                <p className="text-sm text-muted-foreground">Handpicked items for you</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Quick and reliable shipping</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-display font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Safe and encrypted checkout</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-display font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Always here to help</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Placeholder */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl font-display font-bold text-center mb-8">Featured Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Package className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">Product Name</h3>
                  <p className="text-sm text-muted-foreground mb-2">Coming soon</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-primary">₹---</span>
                    <Button size="sm" variant="outline" disabled>
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Products coming soon!</p>
            <Button variant="outline">Notify Me</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">{tenant.store_name}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {tenant.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tenant.address}
                </span>
              )}
              {tenant.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {tenant.phone}
                </span>
              )}
            </div>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-medium text-foreground">StoreSaaS</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
