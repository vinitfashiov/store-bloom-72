import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Store, Plus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  store_name: string;
  store_slug: string;
  business_type: 'ecommerce' | 'grocery';
  plan: 'trial' | 'pro';
  is_primary: boolean;
}

interface StoreSwitcherProps {
  currentTenantId: string;
  onTenantChange: (tenantId: string) => void;
}

export function StoreSwitcher({ currentTenantId, onTenantChange }: StoreSwitcherProps) {
  const [stores, setStores] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_tenants');
      
      if (error) throw error;

      // Fetch full tenant details
      if (data && data.length > 0) {
        const tenantIds = data.map((t: any) => t.tenant_id);
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, store_name, store_slug, business_type, plan')
          .in('id', tenantIds)
          .is('deleted_at', null);

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

  const handleStoreSwitch = async (tenantId: string) => {
    if (tenantId === currentTenantId) return;

    try {
      // Set as primary tenant
      const { error } = await supabase.rpc('set_primary_tenant', {
        p_tenant_id: tenantId,
      });

      if (error) throw error;

      // Refresh and navigate
      onTenantChange(tenantId);
      navigate('/dashboard');
      toast.success('Store switched successfully');
    } catch (error) {
      console.error('Error switching store:', error);
      toast.error('Failed to switch store');
    }
  };

  const handleCreateStore = () => {
    navigate('/onboarding');
  };

  const currentStore = stores.find(s => s.id === currentTenantId);

  if (loading) {
    return <div className="w-32 h-9 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline truncate max-w-[120px]">
            {currentStore?.store_name || 'Select Store'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Stores ({stores.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => handleStoreSwitch(store.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{store.store_name}</span>
              <span className="text-xs text-muted-foreground">
                {store.business_type === 'grocery' ? 'Grocery' : 'E-commerce'} • {store.plan === 'pro' ? 'Pro' : 'Trial'}
              </span>
            </div>
            {store.id === currentTenantId && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateStore} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Create New Store
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/dashboard/stores')} 
          className="cursor-pointer"
        >
          Manage Stores
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

