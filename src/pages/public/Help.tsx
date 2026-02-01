import SEOHead from "@/components/shared/SEOHead";

export default function Help() {
    return (
        <>
            <SEOHead
                title="Help Center & Support – Storekriti"
                description="Get help with your Storekriti store. Tutorials, guides, and customer support contact."
                canonicalUrl="https://storekriti.com/help"
            />

            <div className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-8">How can we help?</h1>
                    <div className="space-y-6">
                        <div className="p-6 border rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
                            <p className="text-muted-foreground">Learn how to set up your store, add products, and configure payments.</p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Account & Billing</h3>
                            <p className="text-muted-foreground">Manage your subscription, update profile, and view invoices.</p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
                            <p className="text-muted-foreground">Need personal assistance? Reach out to our support team.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
