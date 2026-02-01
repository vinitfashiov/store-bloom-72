import SEOHead from "@/components/shared/SEOHead";

export default function Terms() {
    return (
        <>
            <SEOHead
                title="Terms of Service – Storekriti"
                description="Storekriti Terms of Service. Please read these terms carefully before using our platform."
                canonicalUrl="https://storekriti.com/terms"
            />

            <div className="py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-display font-bold mb-8">Terms of Service</h1>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        <p>Last updated: February 1, 2026</p>
                        <p>1. Acceptance of Terms...</p>
                        <p>2. Account Responsibilities...</p>
                        <p>3. Payment Terms...</p>
                        {/* Placeholder content */}
                        <p className="italic">This is a placeholder for the full legal text.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
