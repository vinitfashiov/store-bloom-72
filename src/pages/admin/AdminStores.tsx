import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Store, Plus, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Tenant {
  id: string;
  store_name: string;
  store_slug: string;
  business_type: 'ecommerce' | 'grocery';
  plan: 'trial' | 'pro';
  trial_ends_at: string;
  is_active: boolean;
  created_at: string;
  is_primary: boolean;
}

export default function AdminStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Tenant | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_tenants');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const tenantIds = data.map((t: any) => t.tenant_id);
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, store_name, store_slug, business_type, plan, trial_ends_at, is_active, created_at')
          .in('id', tenantIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (tenantsError) throw tenantsError;

        const storesWithPrimary = tenants?.map((tenant: any) => ({
          ...tenant,
          is_primary: data.find((t: any) => t.tenant_id === tenant.id)?.is_primary || false,
        })) || [];

        setStores(storesWithPrimary);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (store: Tenant) => {
    setStoreToDelete(store);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!storeToDelete) return;

    // Verify confirmation text
    if (deleteConfirmText !== storeToDelete.store_name) {
      toast.error('Store name does not match');
      return;
    }

    try {
      setDeleting(true);
      
      const { error } = await supabase.rpc('delete_tenant', {
        p_tenant_id: storeToDelete.id,
        p_reason: 'User requested deletion',
      });

      if (error) throw error;

      toast.success('Store deleted successfully');
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
      setDeleteConfirmText('');
      
      // Refresh stores list
      await fetchStores();
      
      // If deleted store was current, navigate to dashboard (will redirect if no stores)
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error deleting store:', error);
      toast.error(error.message || 'Failed to delete store');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateStore = () => {
    navigate('/onboarding');
  };

  const handleSwitchStore = async (tenantId: string) => {
    try {
      const { error } = await supabase.rpc('set_primary_tenant', {
        p_tenant_id: tenantId,
      });

      if (error) throw error;

      toast.success('Store switched successfully');
      navigate('/dashboard');
      window.location.reload(); // Reload to refresh context
    } catch (error) {
      console.error('Error switching store:', error);
      toast.error('Failed to switch store');
    }
  };

  const getDaysRemaining = (trialEndsAt: string) => {
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">My Stores</h1>
          <p className="text-muted-foreground">Manage all your stores from one place</p>
        </div>
        <Button onClick={handleCreateStore}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Store
        </Button>
      </div>

      {stores.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No stores yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first store to get started
            </p>
            <Button onClick={handleCreateStore}>
              <Plus className="w-4 h-4 mr-2" />
              Create Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Stores ({stores.length})</CardTitle>
            <CardDescription>
              Each store has independent payment and delivery systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => {
                  const daysRemaining = getDaysRemaining(store.trial_ends_at);
                  const isTrialExpired = store.plan === 'trial' && daysRemaining <= 0;

                  return (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{store.store_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {store.store_slug}
                            </div>
                          </div>
                          {store.is_primary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {store.business_type === 'grocery' ? 'Grocery' : 'E-commerce'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={store.plan === 'pro' ? 'default' : 'secondary'}>
                            {store.plan === 'pro' ? 'Pro' : 'Trial'}
                          </Badge>
                          {store.plan === 'trial' && (
                            <span className="text-xs text-muted-foreground">
                              {isTrialExpired ? 'Expired' : `${daysRemaining} days left`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={store.is_active ? 'default' : 'secondary'}>
                          {store.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(store.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!store.is_primary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSwitchStore(store.id)}
                            >
                              Switch
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/store/${store.store_slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(store)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Store
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>{storeToDelete?.store_name}</strong>? 
                This action cannot be undone.
              </p>
              <p className="text-destructive font-medium">
                This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>All products, orders, and customer data</li>
                <li>Payment and delivery configurations</li>
                <li>Store settings and customizations</li>
                <li>All associated data</li>
              </ul>
              <div className="pt-2">
                <Label htmlFor="confirm-text" className="text-sm font-medium">
                  Type the store name <strong>{storeToDelete?.store_name}</strong> to confirm:
                </Label>
                <Input
                  id="confirm-text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={storeToDelete?.store_name}
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || deleteConfirmText !== storeToDelete?.store_name}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Store'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

