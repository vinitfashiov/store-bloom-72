import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { PreloadLink } from "@/components/PreloadLink";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/store-builder", label: "Store Builder" },
    { href: "/themes", label: "Themes" },
    { href: "/help", label: "Help" },
];

export default function PublicLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                                <Store className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight hidden sm:inline-block">Storekriti</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`transition-colors hover:text-emerald-600 ${location.pathname === link.href ? "text-emerald-600" : "text-muted-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <PreloadLink to="/authentication">Log in</PreloadLink>
                        </Button>
                        <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                            <PreloadLink to="/authentication">
                                Start Free <ArrowRight className="w-4 h-4 ml-1" />
                            </PreloadLink>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t p-4 bg-background">
                        <nav className="flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`text-sm font-medium p-2 rounded-md hover:bg-muted ${location.pathname === link.href ? "text-emerald-600 bg-emerald-50" : "text-muted-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 mt-4">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <PreloadLink to="/authentication">Log in</PreloadLink>
                                </Button>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                                    <PreloadLink to="/authentication">Start Free Trial</PreloadLink>
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        <div className="col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="font-display font-bold text-xl tracking-tight">Storekriti</span>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                The all-in-one multi-tenant platform to launch, manage, and scale your e-commerce or grocery store.
                                Fast setup. Secure by design. No coding required.
                            </p>
                            <div className="flex gap-4">
                                {/* Social Links Placeholders */}
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <span className="sr-only">Facebook</span>
                                    F
                                </div>
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <span className="sr-only">Twitter</span>
                                    X
                                </div>
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <span className="sr-only">LinkedIn</span>
                                    In
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Platform</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                                <li><Link to="/themes" className="hover:text-foreground">Themes</Link></li>
                                <li><Link to="/store-builder" className="hover:text-foreground">Store Builder</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Support</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/help" className="hover:text-foreground">Help Center</Link></li>
                                <li><Link to="/contact" className="hover:text-foreground">Contact Us</Link></li>
                                <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                                <li><Link to="/refund-policy" className="hover:text-foreground">Refund Policy</Link></li>
                                <li><Link to="/shipping-policy" className="hover:text-foreground">Shipping Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} Storekriti. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
