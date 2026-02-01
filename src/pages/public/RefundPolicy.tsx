import SEOHead from "@/components/shared/SEOHead";

export default function RefundPolicy() {
    return (
        <>
            <SEOHead
                title="Refund Policy – Storekriti"
                description="Storekriti Refund Policy. Understand our policies regarding subscription cancellations and refunds."
                canonicalUrl="https://storekriti.com/refund-policy"
            />

            <div className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-display font-bold mb-8">Refund Policy</h1>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        <p>Last updated: February 1, 2026</p>
                        <p>We offer a 7-day free trial so you can test our platform risk-free...</p>
                        {/* Placeholder content */}
                        <p className="italic">This is a placeholder for the full legal text.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
