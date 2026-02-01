import SEOHead from "@/components/shared/SEOHead";
import { Button } from "@/components/ui/button";
import { PreloadLink } from "@/components/PreloadLink";

export default function StoreBuilder() {
    return (
        <>
            <SEOHead
                title="Online Store Builder – Storekriti | No Code Website Builder"
                description="Create your own online store with Storekriti's easy-to-use drag and drop builder. No coding skills required."
                canonicalUrl="https://storekriti.com/store-builder"
            />

            <div className="py-20 bg-background">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-6">Built for Everyone</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Design your dream store with our intuitive builder. Customize layouts, add products, and go live in minutes.
                    </p>
                    <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                        <PreloadLink to="/authentication">Try Store Builder Free</PreloadLink>
                    </Button>
                </div>
            </div>
        </>
    );
}
