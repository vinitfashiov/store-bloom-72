import { useState, useEffect } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const onboardingData = [
    {
        image: "/src/assets/onboarding_store.png",
        title: "Goods delivery is now easier",
        description: "Now, managing goods delivery has become simpler than ever.",
    },
    {
        image: "/src/assets/onboarding_delivery.png",
        title: "Package tracking is safer",
        description: "Tracking your package ensures a safer delivery experience.",
    },
    {
        image: "/src/assets/onboarding_analytics.png",
        title: "Use points for shipping deals",
        description: "Consider utilizing points to unlock exclusive shipping deals.",
    },
];

export function AuthCarousel() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) return;

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-background/50">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
            </div>

            <Carousel setApi={setApi} className="w-full max-w-sm h-full relative z-10">
                <CarouselContent className="h-full">
                    {onboardingData.map((item, index) => (
                        <CarouselItem key={index} className="flex flex-col items-center justify-center text-center h-full px-6 pt-8 pb-0">
                            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center mb-6">
                                <div className="relative w-full h-full max-h-[400px] flex items-center justify-center">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="max-w-full max-h-full object-contain drop-shadow-2xl animate-fade-in"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 mb-8 animate-slide-up">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground/90 font-display">
                                    {item.title}
                                </h2>
                                <p className="text-muted-foreground text-base max-w-[300px] mx-auto leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Custom Dots Indicator */}
            <div className="flex gap-2.5 mb-2 z-20">
                {onboardingData.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-500 ease-out",
                            current === index
                                ? "w-8 bg-[#34A853] shadow-sm"
                                : "w-2 bg-[#34A853]/20 hover:bg-[#34A853]/30"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
