import { Link } from 'react-router-dom';
import { Store, MapPin, Phone, Mail } from 'lucide-react';

interface StoreFooterProps {
  storeName: string;
  storeSlug: string;
  address: string | null;
  phone: string | null;
  email?: string | null;
}

export function StoreFooter({ storeName, storeSlug, address, phone, email }: StoreFooterProps) {
  return (
    <footer className="border-t border-border py-8 px-4 mt-auto bg-card">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">{storeName}</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {address}
                </p>
              )}
              {phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  {phone}
                </p>
              )}
              {email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  {email}
                </p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/store/${storeSlug}/products`} className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeSlug}/cart`} className="text-muted-foreground hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeSlug}/account`} className="text-muted-foreground hover:text-foreground transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-display font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={`/store/${storeSlug}/page/about`} className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeSlug}/page/contact`} className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeSlug}/page/terms`} className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to={`/store/${storeSlug}/page/privacy`} className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-medium text-foreground">StoreSaaS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
