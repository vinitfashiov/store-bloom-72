import SEOHead from "@/components/shared/SEOHead";

export default function Themes() {
    return (
        <>
            <SEOHead
                title="Ecommerce Themes & Templates – Storekriti"
                description="Browse our collection of beautiful, responsive ecommerce themes. Designed to convert visitors into customers."
                canonicalUrl="https://storekriti.com/themes"
            />

            <div className="py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-8 text-center">Stunning Themes</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="border rounded-xl overflow-hidden shadow-sm">
                                <div className="h-48 bg-muted animate-pulse"></div>
                                <div className="p-4">
                                    <h3 className="font-semibold mb-1">Modern Shop {n}</h3>
                                    <p className="text-sm text-muted-foreground">Responsive • Fast • SEO Ready</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
