import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ExternalLink,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useOptimizedQueries';

interface Tenant {
  id: string;
  store_name: string;
  store_slug: string;
  business_type: string;
  plan: string;
  trial_ends_at: string;
}

interface AdminDashboardProps {
  tenant: Tenant;
  isTrialExpired: boolean;
}

export default function AdminDashboard({ tenant, isTrialExpired }: AdminDashboardProps) {
  const { data: stats, isLoading, refetch, isFetching } = useDashboardStats(tenant.id);

  const getDaysRemaining = () => {
    const now = new Date();
    const trialEnd = new Date(tenant.trial_ends_at);
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Plan Status */}
      {tenant.plan === 'trial' && !isTrialExpired && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">{getDaysRemaining()} days left in your trial</p>
                <p className="text-sm text-muted-foreground">Upgrade to Pro for unlimited access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tenant.plan === 'pro' && (
        <Card className="border-success bg-success/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">Pro Plan Active</p>
                <p className="text-sm text-muted-foreground">Full access to all features</p>
              </div>
              <Badge className="ml-auto bg-success text-success-foreground">PRO</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Overview (Last 30 Days)</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-display font-bold">
                {formatCurrency(Number(stats?.total_revenue) || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold">
                  {formatNumber(Number(stats?.total_orders) || 0)}
                </span>
                {Number(stats?.pending_orders) > 0 && (
                  <Badge variant="outline" className="text-warning border-warning">
                    {stats?.pending_orders} pending
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold">Active</span>
                {Number(stats?.low_stock_products) > 0 && (
                  <Badge variant="destructive">
                    {stats?.low_stock_products} low stock
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-display font-bold">
                {formatNumber(Number(stats?.total_customers) || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Avg Order Value */}
      {stats && Number(stats.avg_order_value) > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-xl font-bold">{formatCurrency(Number(stats.avg_order_value))}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your store</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="w-full justify-start h-12">
              <Link to="/dashboard/products">
                <Package className="w-4 h-4 mr-2" />
                <span className="truncate">Products</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start h-12">
              <Link to="/dashboard/orders">
                <ShoppingBag className="w-4 h-4 mr-2" />
                <span className="truncate">Orders</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start h-12">
              <Link to="/dashboard/integrations">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="truncate">Payments</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start h-12">
              <Link to={`/store/${tenant.store_slug}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="truncate">Store</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete these steps to launch</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {/* Store Created */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <span className="text-sm font-medium text-success leading-tight">
                Store Created
              </span>
            </div>

            {/* Add Products */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              <span className="text-sm font-medium text-success leading-tight">
                Add Products
              </span>
            </div>

            {/* Configure Payments */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0" />
              <span className="text-sm leading-tight">Payments</span>
            </div>

            {/* First Sale */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${Number(stats?.total_orders) > 0 ? 'bg-success/10' : 'bg-muted'}`}>
              {Number(stats?.total_orders) > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground shrink-0" />
              )}
              <span className={`text-sm leading-tight ${Number(stats?.total_orders) > 0 ? 'text-success font-medium' : ''}`}>First Sale</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
