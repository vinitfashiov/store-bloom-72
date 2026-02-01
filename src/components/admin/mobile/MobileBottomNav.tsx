import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, ShoppingCart, Package, Zap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
    storeSlug: string;
}

export function MobileBottomNav({ storeSlug }: MobileBottomNavProps) {
    const location = useLocation();
    const pathname = location.pathname;

    const NAV_ITEMS = [
        {
            icon: LayoutGrid,
            label: "Home",
            href: "/dashboard",
            isActive: pathname === "/dashboard",
        },
        {
            icon: ShoppingCart,
            label: "Orders",
            href: "/dashboard/orders",
            isActive: pathname.includes("/orders"),
        },
        {
            icon: Package,
            label: "Products",
            href: "/dashboard/products",
            isActive: pathname.includes("/products"),
        },
        {
            icon: Zap,
            label: "Apps",
            href: "/dashboard/integrations",
            isActive: pathname.includes("/integrations") || pathname.includes("/apps"),
        },
        {
            icon: Settings,
            label: "Settings",
            href: "/dashboard/settings",
            isActive: pathname.includes("/settings") && !pathname.includes("/integrations"),
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe">
            <div className="flex items-center justify-between px-2 h-[60px]">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1",
                            item.isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        <div className={cn(
                            "px-5 py-1 rounded-2xl transition-all",
                            item.isActive ? "bg-secondary" : "bg-transparent"
                        )}>
                            <item.icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
