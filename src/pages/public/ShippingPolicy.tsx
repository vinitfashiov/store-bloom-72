import SEOHead from "@/components/shared/SEOHead";

export default function ShippingPolicy() {
    return (
        <>
            <SEOHead
                title="Shipping Policy – Storekriti"
                description="Shipping Policy for Storekriti platform services. (Note: This applies to Storekriti services, not individual tenant stores)."
                canonicalUrl="https://storekriti.com/shipping-policy"
            />

            <div className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-display font-bold mb-8">Shipping Policy</h1>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        <p>Since Storekriti is a SaaS platform, we do not ship physical products...</p>
                        {/* Placeholder content */}
                        <p className="italic">This is a placeholder for the full legal text.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
