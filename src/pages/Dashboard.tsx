import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Store, 
  LogOut, 
  ExternalLink, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Users,
  BarChart3
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, tenant, loading, signOut, refreshTenant } = useAuth();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !profile?.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, profile, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  const getDaysRemaining = () => {
    if (!tenant?.trial_ends_at) return 0;
    const now = new Date();
    const trialEnd = new Date(tenant.trial_ends_at);
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const isTrialExpired = () => {
    return tenant?.plan === 'trial' && getDaysRemaining() <= 0;
  };

  const handleUpgrade = async () => {
    toast.info('Razorpay integration requires API keys. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments.');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const daysRemaining = getDaysRemaining();
  const trialExpired = isTrialExpired();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-foreground">{tenant.store_name}</h1>
              <p className="text-xs text-muted-foreground">/{tenant.store_slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to={`/store/${tenant.store_slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Store
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Trial/Subscription Banner */}
        {tenant.plan === 'trial' && (
          <Card className={`mb-8 ${trialExpired ? 'border-destructive bg-destructive/5' : 'border-warning bg-warning/5'}`}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {trialExpired ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning" />
                  )}
                  <div>
                    {trialExpired ? (
                      <>
                        <p className="font-medium text-destructive">Your trial has expired</p>
                        <p className="text-sm text-muted-foreground">Upgrade now to restore access to your store</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-foreground">{daysRemaining} days left in your trial</p>
                        <p className="text-sm text-muted-foreground">Upgrade to Pro to unlock all features</p>
                      </>
                    )}
                  </div>
                </div>
                <Button onClick={handleUpgrade} disabled={isPaymentLoading} className="shadow-glow">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isPaymentLoading ? 'Processing...' : 'Upgrade to Pro - ₹249/mo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tenant.plan === 'pro' && (
          <Card className="mb-8 border-success bg-success/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-foreground">Pro Plan Active</p>
                  <p className="text-sm text-muted-foreground">You have access to all features</p>
                </div>
                <Badge className="ml-auto bg-success text-success-foreground">PRO</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">₹0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Start selling to earn</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">No orders yet</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Grow your audience</p>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold">0%</div>
              <p className="text-xs text-muted-foreground mt-1">Visitors to customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="font-display">Store Settings</CardTitle>
              <CardDescription>Manage your store configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium">Store Name</p>
                  <p className="text-sm text-muted-foreground">{tenant.store_name}</p>
                </div>
                <Badge variant="outline">{tenant.business_type}</Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium">Store URL</p>
                  <p className="text-sm text-muted-foreground">/store/{tenant.store_slug}</p>
                </div>
                <Link to={`/store/${tenant.store_slug}`} target="_blank">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {tenant.address && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{tenant.address}</p>
                </div>
              )}

              {tenant.phone && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle className="font-display">Getting Started</CardTitle>
              <CardDescription>Complete these steps to launch your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium text-success">Store Created</p>
                  <p className="text-sm text-muted-foreground">Your store is live</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Add Products</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Configure Payments</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Launch Marketing</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
