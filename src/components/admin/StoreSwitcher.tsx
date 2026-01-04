import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Store, ChevronDown, Plus, Check, Settings, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StoreSwitcherProps {
  currentTenantId: string;
  storeName: string;
  onTenantChange: (tenantId: string) => void;
}

export function StoreSwitcher({ currentTenantId, storeName, onTenantChange }: StoreSwitcherProps) {
  const navigate = useNavigate();
  const { tenants } = useAuth();

  const handleSwitchStore = (tenantId: string) => {
    if (tenantId !== currentTenantId) {
      onTenantChange(tenantId);
    }
  };

  const handleManageStores = () => {
    navigate('/dashboard/stores');
  };

  const handleCreateStore = () => {
    navigate('/onboarding?new=true');
  };

  // If only one store, show simple button
  if (tenants.length <= 1) {
    return (
      <Button variant="outline" className="gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors" onClick={handleManageStores}>
        <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Store className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
        <span className="hidden sm:inline truncate max-w-[120px] font-medium">
          {storeName || 'My Store'}
        </span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors group">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Store className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline truncate max-w-[120px] font-medium">
            {storeName || 'My Store'}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-70 transition-opacity" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Your Stores
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {tenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => handleSwitchStore(tenant.id)}
              className="cursor-pointer py-3 px-3 hover:bg-primary/5 focus:bg-primary/5"
            >
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    tenant.id === currentTenantId ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{tenant.store_name}</span>
                      {tenant.plan === 'pro' && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 flex-shrink-0">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {tenant.business_type === 'grocery' ? 'Grocery Store' : 'E-commerce Store'}
                    </p>
                  </div>
                </div>
                {tenant.id === currentTenantId && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleManageStores} className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Manage Stores
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCreateStore} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Create New Store
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
