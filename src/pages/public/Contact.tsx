import SEOHead from "@/components/shared/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
    return (
        <>
            <SEOHead
                title="Contact Us – Storekriti Support"
                description="Get in touch with the Storekriti team. We are here to help you with sales inquiries, technical support, and general questions."
                canonicalUrl="https://storekriti.com/contact"
            />

            <div className="py-20">
                <div className="container mx-auto px-4 max-w-xl">
                    <h1 className="text-4xl font-display font-bold tracking-tight mb-8 text-center">Contact Us</h1>
                    <p className="text-center text-muted-foreground mb-8">
                        Have questions? We'd love to hear from you.
                    </p>

                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <Input id="name" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <Input id="email" type="email" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <Textarea id="message" placeholder="How can we help?" rows={5} />
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Send Message</Button>
                    </form>
                </div>
            </div>
        </>
    );
}
