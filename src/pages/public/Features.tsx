import { Check } from "lucide-react";
import SEOHead from "@/components/shared/SEOHead";

export default function Features() {
    return (
        <>
            <SEOHead
                title="Ecommerce Features – Storekriti | Online Store Builder"
                description="Explore the powerful features of Storekriti: Store builder, themes, payment gateway integration, analytics, and more."
                canonicalUrl="https://storekriti.com/features"
            />

            <div className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl font-display font-bold tracking-tight mb-4">Powerful Ecommerce Features</h1>
                        <p className="text-lg text-muted-foreground">
                            Everything you need to build, run, and scale your online business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "Store Builder", desc: "Drag-and-drop page builder to customize your store without code." },
                            { title: "Mobile Responsive", desc: "Your store looks great on every device, automatically." },
                            { title: "Payment Gateways", desc: "Integrated with Razorpay, UPI, and more for seamless checkout." },
                            { title: "Order Management", desc: "Track, process, and fulfill orders from a single dashboard." },
                            { title: "Analytics", desc: "Real-time insights into sales, visitors, and growth." },
                            { title: "SEO Optimization", desc: "Built-in tools to help your store rank higher on Google." },
                        ].map((feature, i) => (
                            <div key={i} className="p-6 border rounded-xl bg-background hover:shadow-lg transition-shadow">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                                    <Check className="w-5 h-5 text-emerald-700" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
