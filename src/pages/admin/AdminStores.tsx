import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { Store, Plus, ExternalLink, Trash2, Star, Check, ShoppingCart, Apple, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

interface AdminStoresProps {
  onTenantChange: (tenantId: string) => void;
  onRefresh: () => Promise<void>;
}

export default function AdminStores({ onTenantChange, onRefresh }: AdminStoresProps) {
  const navigate = useNavigate();
  const { tenants, tenant: currentTenant, user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [switchingStoreId, setSwitchingStoreId] = useState<string | null>(null);

  const handleCreateStore = () => {
    navigate('/onboarding?new=true');
  };

  const handleSwitchStore = async (tenantId: string) => {
    if (tenantId === currentTenant?.id) return;

    // Show loading state
    setSwitchingStoreId(tenantId);

    try {
      // Switch the store - context update will automatically trigger re-render
      await onTenantChange(tenantId);

      // Clear switching state after context updates
      // The UI will update automatically with the new currentTenant from context
      setTimeout(() => {
        setSwitchingStoreId(null);
      }, 100);

      toast.success('Store switched successfully');
    } catch (error) {
      console.error('Error switching store:', error);
      toast.error('Failed to switch store');
      setSwitchingStoreId(null);
    }
  };

  const handleDeleteClick = (tenantId: string) => {
    if (tenants.length <= 1) {
      toast.error('You cannot delete your only store');
      return;
    }
    setStoreToDelete(tenantId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setConfirmDialogOpen(true);
    setConfirmText('');
  };

  const handleFinalDelete = async () => {
    if (!storeToDelete || confirmText !== 'DELETE') return;

    setIsDeleting(true);

    try {
      const { error } = await supabase.rpc('delete_tenant', { target_tenant_id: storeToDelete });

      if (error) throw error;

      toast.success('Store deleted successfully');
      setConfirmDialogOpen(false);
      setStoreToDelete(null);
      setConfirmText('');

      // Refresh tenants and switch to another store if we deleted the current one
      await onRefresh();

      if (storeToDelete === currentTenant?.id) {
        const remainingTenants = tenants.filter(t => t.id !== storeToDelete);
        if (remainingTenants.length > 0) {
          onTenantChange(remainingTenants[0].id);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete store');
    } finally {
      setIsDeleting(false);
    }
  };

  const getDaysRemaining = (trialEndsAt: string) => {
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const storeToDeleteName = tenants.find(t => t.id === storeToDelete)?.store_name || '';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold">My Stores</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage all your stores from one place</p>
        </div>
        <Button onClick={handleCreateStore} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Create New Store</span>
          <span className="sm:hidden">New Store</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tenants.map((store) => {
          // Use switchingStoreId if switching is in progress, otherwise use currentTenant
          const isCurrentStore = switchingStoreId
            ? store.id === switchingStoreId
            : store.id === currentTenant?.id;
          const isSwitching = switchingStoreId === store.id;
          const daysRemaining = getDaysRemaining(store.trial_ends_at);
          const isExpired = store.plan === 'trial' && daysRemaining <= 0;

          return (
            <Card
              key={store.id}
              className={`relative transition-all duration-300 ${isCurrentStore
                  ? 'ring-2 ring-primary shadow-md bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20'
                  : 'hover:border-primary/50 hover:shadow-sm'
                } ${isSwitching ? 'opacity-60 scale-[0.98]' : ''}`}
            >
              <CardContent className="p-4 sm:p-6">
                {/* Card Layout - All Screens */}
                <div className="flex flex-col gap-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${store.business_type === 'grocery'
                          ? 'bg-gradient-to-br from-accent/20 to-accent/10 text-accent shadow-sm'
                          : 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm'
                        } ${isCurrentStore ? 'ring-2 ring-primary/30 scale-105' : ''}`}>
                        {store.business_type === 'grocery' ? (
                          <Apple className="w-6 h-6 sm:w-7 sm:h-7" />
                        ) : (
                          <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
                        )}
                        {isCurrentStore && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className={`font-semibold text-base sm:text-lg truncate transition-colors ${isCurrentStore ? 'text-primary' : 'text-foreground'
                            }`}>
                            {store.store_name}
                          </h3>
                          {store.is_primary && (
                            <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="font-mono text-[10px] sm:text-xs bg-muted/50 px-2 py-0.5 rounded">
                            /store/{store.store_slug}
                          </span>
                          <Badge
                            variant={store.plan === 'pro' ? 'default' : isExpired ? 'destructive' : 'secondary'}
                            className="text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 whitespace-nowrap shadow-sm"
                          >
                            {store.plan === 'pro' ? (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/80"></span>
                                Pro
                              </span>
                            ) : isExpired ? (
                              'Expired'
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                Trial ({daysRemaining}d)
                              </span>
                            )}
                          </Badge>
                          <span className="capitalize text-xs bg-muted/30 px-2 py-0.5 rounded">
                            {store.business_type}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Switch Section with Actions */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Switch Control */}
                    <div className={`flex items-center justify-between flex-1 px-4 py-3 rounded-lg transition-all duration-300 ${isCurrentStore ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}>
                      <div className="flex items-center gap-2">
                        {isSwitching ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm font-medium text-primary">Switching...</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-muted-foreground">
                            {isCurrentStore ? 'Active Store' : 'Inactive Store'}
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={isCurrentStore}
                        disabled={isSwitching || !!switchingStoreId}
                        onCheckedChange={() => !isCurrentStore && handleSwitchStore(store.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all shadow-sm hover:shadow-md group"
                        asChild
                        title="View Store"
                      >
                        <a
                          href={`/store/${store.store_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="hidden sm:inline text-xs font-medium">View</span>
                        </a>
                      </Button>

                      {tenants.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-lg border-destructive/20 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-all shadow-sm hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(store.id);
                          }}
                          title="Delete Store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Store Card */}
        <Card
          className="border-2 border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          onClick={handleCreateStore}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                  Create New Store
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
                  Add another store to your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{storeToDeleteName}</strong>?
              This action will permanently remove all store data including products, orders, and customers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Confirmation Dialog with Type Confirmation */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Permanent Deletion</DialogTitle>
            <DialogDescription>
              This action <strong>cannot be undone</strong>. All data associated with{' '}
              <strong>{storeToDeleteName}</strong> will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/10 rounded-lg text-sm">
              <p className="font-medium text-destructive mb-2">The following will be deleted:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All products and categories</li>
                <li>All orders and customer data</li>
                <li>All store settings and configurations</li>
                <li>All uploaded images and assets</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="DELETE"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== 'DELETE' || isDeleting}
              onClick={handleFinalDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Store Permanently'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
