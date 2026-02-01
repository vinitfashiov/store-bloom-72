import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { PreloadLink } from "@/components/PreloadLink";
import SEOHead from "@/components/shared/SEOHead";

export default function Pricing() {
    const schema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "PriceSpecification",
        "priceCurrency": "INR",
        "price": "0",
        "validFrom": "2024-01-01",
        "validThrough": "2025-12-31"
    });

    return (
        <>
            <SEOHead
                title="Pricing Plans – Storekriti | Start Free Trial"
                description="Simple, transparent pricing. Start with a free 7-day trial. Upgrade to Pro for unlimited products and advanced analytics."
                canonicalUrl="https://storekriti.com/pricing"
                schema={schema}
            />

            <div className="py-20 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-4xl font-display font-bold tracking-tight mb-4">Pricing Plans</h1>
                        <p className="text-lg text-muted-foreground">
                            Choose the perfect plan for your business. No hidden fees.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Trial */}
                        <Card className="border bg-background">
                            <CardHeader>
                                <CardTitle className="text-xl font-display font-bold">Free Trial</CardTitle>
                                <CardDescription>Perfect for testing the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <span className="text-4xl font-display font-bold tracking-tight">₹0</span>
                                    <span className="text-muted-foreground"> / 7 days</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> All features included</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Up to 10 products</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Basic Analytics</li>
                                </ul>
                                <Button variant="outline" className="w-full" asChild>
                                    <PreloadLink to="/authentication">Start Free Trial</PreloadLink>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="border-emerald-600 bg-emerald-50/10">
                            <CardHeader>
                                <CardTitle className="text-xl font-display font-bold">Pro Plan</CardTitle>
                                <CardDescription>For growing businesses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <span className="text-4xl font-display font-bold tracking-tight">₹1</span>
                                    <span className="text-muted-foreground"> / month</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Unlimited products</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Advanced Analytics</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Priority Support</li>
                                    <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-600" /> Custom Domain</li>
                                </ul>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                                    <PreloadLink to="/authentication">Get Started</PreloadLink>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
