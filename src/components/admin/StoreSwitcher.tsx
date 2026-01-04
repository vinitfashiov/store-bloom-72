import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

interface StoreSwitcherProps {
  currentTenantId: string;
  storeName: string;
  onTenantChange: (tenantId: string) => void;
}

export function StoreSwitcher({ storeName }: StoreSwitcherProps) {
  const navigate = useNavigate();

  const handleOpenStore = () => {
    navigate('/dashboard');
  };

  return (
    <Button variant="outline" className="gap-2" onClick={handleOpenStore}>
      <Store className="w-4 h-4" />
      <span className="hidden sm:inline truncate max-w-[120px]">
        {storeName || 'My Store'}
      </span>
    </Button>
  );
}
