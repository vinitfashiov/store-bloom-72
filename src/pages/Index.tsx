import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  CreditCard,
  Check,
  Users,
  BarChart3
} from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">StoreSaaS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/auth">
              <Button className="shadow-glow">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 animate-fade-in" variant="secondary">
            ✨ Launch your store in minutes
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight animate-slide-up">
            Build Your Online
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Empire Today
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            The all-in-one multi-tenant SaaS platform to launch, manage, and scale your 
            e-commerce or grocery store. No coding required.
          </p>
          
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/auth">
              <Button size="lg" className="shadow-glow text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            7-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Features</Badge>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you launch, grow, and manage your online store effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 animate-slide-up">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">Instant Setup</h3>
                <p className="text-muted-foreground">
                  Go from idea to live store in under 5 minutes. Our guided onboarding makes it effortless.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">Multi-Tenant Architecture</h3>
                <p className="text-muted-foreground">
                  Each store is completely isolated. Your data and customers are always secure.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">Enterprise Security</h3>
                <p className="text-muted-foreground">
                  Bank-grade security with row-level data isolation. Your business is protected.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-7 h-7 text-warning" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">Integrated Payments</h3>
                <p className="text-muted-foreground">
                  Accept payments via Razorpay. Secure, fast, and reliable transaction processing.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-info" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">Customer Management</h3>
                <p className="text-muted-foreground">
                  Build relationships with your customers. Track orders and grow your audience.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-destructive" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Real-time insights into your store performance. Make data-driven decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">Pricing</Badge>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative animate-slide-up">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-display font-bold mb-2">Free Trial</h3>
                <p className="text-muted-foreground mb-6">Perfect for getting started</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">₹0</span>
                  <span className="text-muted-foreground"> / 7 days</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {['Full store functionality', 'Up to 10 products', 'Basic analytics', 'Email support'].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button variant="outline" className="w-full">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border-primary shadow-glow animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="gradient-primary text-primary-foreground border-0">Most Popular</Badge>
              </div>
              <CardContent className="pt-8">
                <h3 className="text-2xl font-display font-bold mb-2">Pro Plan</h3>
                <p className="text-muted-foreground mb-6">For growing businesses</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold">₹249</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited products',
                    'Advanced analytics',
                    'Priority support',
                    'Custom domain',
                    'Remove branding',
                    'API access'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button className="w-full shadow-glow">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">
              Ready to launch your store?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of entrepreneurs building their online empires with StoreSaaS.
            </p>
            <Link to="/auth">
              <Button size="lg" className="shadow-glow text-lg px-10 py-6">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">StoreSaaS</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 StoreSaaS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
