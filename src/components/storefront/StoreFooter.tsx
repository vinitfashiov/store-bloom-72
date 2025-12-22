import { Store, MapPin, Phone } from 'lucide-react';

interface StoreFooterProps {
  storeName: string;
  address: string | null;
  phone: string | null;
}

export function StoreFooter({ storeName, address, phone }: StoreFooterProps) {
  return (
    <footer className="border-t border-border py-8 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">{storeName}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {address}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {phone}
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
  );
}
