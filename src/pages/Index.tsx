import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PreloadLink } from "@/components/PreloadLink";
import SEOHead from "@/components/shared/SEOHead";
import {
  Store,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  CreditCard,
  Check,
  Users,
  BarChart3,
  Sparkles,
  Boxes,
  Workflow,
  Star,
  ChevronRight,
  Play,
  ArrowUpRight,
  Layers,
  Lock,
  LineChart,
  MousePointerClick,
  Palette,
  Server,
} from "lucide-react";

/* ─── ROTATING WORDS ─── */
const ROTATING_WORDS = [
  "scale with you",
  "convert visitors",
  "drive revenue",
  "delight customers",
];

/* ─── LOGO MARQUEE (social proof) ─── */
const TRUSTED_LOGOS = [
  "FreshMart",
  "UrbanBites",
  "StyleHub",
  "GroceryNow",
  "FoodieBox",
  "ShopEasy",
  "QuickKart",
  "NatureBowl",
  "TrendyWear",
  "HealthyBite",
  "DailyNeeds",
  "SpiceRoute",
];

/* ─── FEATURES ─── */
const FEATURES = [
  {
    icon: Zap,
    title: "Launch in minutes",
    desc: "Guided onboarding, templates, and instant store setup — no coding required.",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
  },
  {
    icon: Globe,
    title: "Multi-tenant architecture",
    desc: "Isolated stores with data separation, scaling safely for thousands of tenants.",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Security by design",
    desc: "RBAC, audit logs, and best-practice defaults to protect customer data.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: CreditCard,
    title: "Payments & billing",
    desc: "Razorpay-ready checkout and subscription billing for SaaS monetization.",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: Users,
    title: "Customer management",
    desc: "Orders, customers, retention, and operational workflows in one place.",
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics & insights",
    desc: "Store-level and platform-level data to optimize growth and revenue.",
    gradient: "from-sky-500 to-indigo-500",
    bg: "bg-sky-500/10",
  },
];

/* ─── PRODUCT TOUR TABS ─── */
const PRODUCT_TABS = [
  {
    id: "storefront",
    icon: Palette,
    label: "Storefront",
    title: "Beautiful storefronts that convert",
    desc: "Drag-and-drop themes, mobile-first design, and custom domains. Each tenant gets a polished storefront that looks like a standalone brand.",
    features: [
      "Drag & drop page builder",
      "Mobile-optimized themes",
      "Custom domain mapping",
      "SEO-ready pages",
    ],
  },
  {
    id: "management",
    icon: Layers,
    label: "Management",
    title: "Run operations from one dashboard",
    desc: "Products, orders, inventory, and customer data — all managed from a single admin console with tenant-level isolation.",
    features: [
      "Centralized product catalog",
      "Order management pipeline",
      "Inventory tracking",
      "Customer segmentation",
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    label: "Payments",
    title: "Accept payments seamlessly",
    desc: "Razorpay integration, subscription billing, split payouts, and automated invoicing built for multi-tenant commerce.",
    features: [
      "Razorpay checkout flows",
      "Subscription billing",
      "Split vendor payouts",
      "Automated invoicing",
    ],
  },
  {
    id: "analytics",
    icon: LineChart,
    label: "Analytics",
    title: "Data-driven decisions at every level",
    desc: "Platform-wide and store-level analytics. Track revenue, orders, conversion funnels, and customer lifetime value.",
    features: [
      "Revenue dashboards",
      "Conversion funnels",
      "Customer LTV tracking",
      "Real-time metrics",
    ],
  },
];

/* ─── SOLUTIONS ─── */
const SOLUTIONS = [
  {
    icon: Boxes,
    title: "Agency / Studio",
    desc: "Manage multiple client stores from a single dashboard with white-label branding.",
    stat: "50+",
    statLabel: "stores per account",
  },
  {
    icon: Store,
    title: "SaaS Founders",
    desc: "Ship a store-builder product with tiers, add-ons, and analytics on day one.",
    stat: "10x",
    statLabel: "faster to market",
  },
  {
    icon: Workflow,
    title: "Vertical Marketplaces",
    desc: "Onboard sellers faster with isolated catalogs, themes, and payment setup.",
    stat: "99.9%",
    statLabel: "uptime SLA",
  },
];

/* ─── STATS ─── */
const STATS = [
  { value: 10000, suffix: "+", label: "Stores created", prefix: "" },
  { value: 99.9, suffix: "%", label: "Uptime", prefix: "" },
  { value: 1, suffix: "s", label: "Avg load time", prefix: "< " },
  { value: 24, suffix: "/7", label: "Support", prefix: "" },
];

/* ─── FAQ ─── */
const FAQ = [
  {
    q: "Is Storekriti a website builder or a full SaaS platform?",
    a: "It's a multi-tenant SaaS platform: tenant stores + admin console + payments + analytics, built to run many stores at scale.",
  },
  {
    q: "Can each tenant map a custom domain?",
    a: "Yes. Tenants can map custom domains, while you keep a default platform domain for instant onboarding.",
  },
  {
    q: "How do you handle tenant isolation?",
    a: "Stores are isolated by tenant boundaries (data + configuration), designed for safe scaling and controlled access.",
  },
  {
    q: "Does it support Razorpay?",
    a: "Yes — Razorpay-friendly flows (checkout + webhook patterns) are supported for ecommerce and subscriptions.",
  },
  {
    q: "Can I white-label the platform?",
    a: "Absolutely. Remove Storekriti branding, use your own logo, colors, and domain. Your customers never know we exist.",
  },
  {
    q: "What kind of support do you offer?",
    a: "24/7 priority support for Pro plans, including dedicated onboarding, API integration help, and a shared Slack channel.",
  },
];

/* ═══════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════ */
function useCountUp(
  end: number,
  duration = 2000,
  startOnView = true
): [number, React.RefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCount(Math.floor(eased * end * 10) / 10);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return [count, ref];
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Index() {
  const [wordIndex, setWordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("storefront");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Rotate hero words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Stat counters
  const [stat0, ref0] = useCountUp(STATS[0].value, 2000);
  const [stat1, ref1] = useCountUp(STATS[1].value, 1500);
  const [stat2, ref2] = useCountUp(STATS[2].value, 1000);
  const [stat3, ref3] = useCountUp(STATS[3].value, 1200);
  const statValues = [stat0, stat1, stat2, stat3];
  const statRefs = [ref0, ref1, ref2, ref3];

  const activeTabData = PRODUCT_TABS.find((t) => t.id === activeTab)!;

  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Storekriti",
    url: "https://www.storekriti.com",
    logo: "https://www.storekriti.com/logo.png",
    sameAs: [
      "https://www.facebook.com/storekriti",
      "https://www.instagram.com/storekriti",
      "https://www.linkedin.com/company/storekriti",
    ],
  });

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="Storekriti – India's D2C Ecommerce Store Builder"
        description="Create your online store in minutes with Storekriti. Launch, manage and grow your ecommerce or grocery business with zero coding."
        canonicalUrl="https://storekriti.com"
        schema={schema}
      />

      {/* ═══════════════════════════════════════
          INLINE STYLES FOR ANIMATIONS
      ═══════════════════════════════════════ */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes word-rotate-in {
          0% { opacity: 0; transform: translateY(30px) rotateX(-40deg); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0); }
        }
        @keyframes word-rotate-out {
          0% { opacity: 1; transform: translateY(0) rotateX(0deg); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-30px) rotateX(40deg); filter: blur(4px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-fade-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-word-in {
          animation: word-rotate-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-fade-up {
          animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-fade-in {
          animation: scale-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }

        /* Gradient text helper */
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Glass card */
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-light {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        /* Hover lift */
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        /* Gradient border card */
        .gradient-border {
          position: relative;
          background: hsl(var(--card));
          border-radius: 1rem;
          overflow: hidden;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1.5px;
          border-radius: 1rem;
          background: linear-gradient(135deg, hsl(220 70% 55%), hsl(165 80% 45%), hsl(280 70% 55%));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Dot grid pattern */
        .dot-grid {
          background-image: radial-gradient(circle, hsl(220 15% 80%) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .dot-grid {
          background-image: radial-gradient(circle, hsl(220 15% 25%) 1px, transparent 1px);
        }

        /* Tab progress bar */
        .tab-progress {
          animation: progress-fill 6s linear forwards;
        }

        /* Marquee mask */
        .marquee-mask {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>

      {/* ═══════════════════════════════════════
          HERO
          Inspired by: Hyperzod dark hero + Framer dual-CTA + Shopify rotating text
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0a0a0f]">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/15 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-[40%] left-[50%] w-[30%] h-[40%] rounded-full bg-emerald-500/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Announcement badge */}
            <div className="animate-fade-up opacity-0 stagger-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-sm px-4 py-1.5 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/70 font-medium">
                Multi-tenant ecommerce platform
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            </div>

            {/* Main heading with rotating words */}
            <h1 className="animate-fade-up opacity-0 stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Build stores that
              <br />
              <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
                <span
                  key={wordIndex}
                  className="animate-word-in inline-block bg-gradient-to-r from-blue-400 via-emerald-400 to-violet-400 text-gradient"
                >
                  {ROTATING_WORDS[wordIndex]}
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up opacity-0 stagger-3 mt-6 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
              Launch, manage, and grow multi-tenant ecommerce stores with
              enterprise-grade security, blazing speed, and an admin experience your
              customers will love.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up opacity-0 stagger-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-13 px-8 rounded-full bg-white text-[#0a0a0f] hover:bg-white/90 font-semibold text-base shadow-lg shadow-white/10 transition-all hover:shadow-white/20 hover:scale-[1.02]"
                asChild
              >
                <PreloadLink to="/authentication">
                  Start free trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </PreloadLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 rounded-full border-white/15 text-white hover:bg-white/[0.06] bg-transparent font-medium text-base"
                asChild
              >
                <PreloadLink to="/pricing">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  See how it works
                </PreloadLink>
              </Button>
            </div>

            <p className="animate-fade-up opacity-0 stagger-5 mt-5 text-sm text-white/30">
              7-day free trial &middot; No credit card required &middot; Cancel anytime
            </p>

            {/* ─── Dashboard Preview (Glassmorphic) ─── */}
            <div className="mt-16 md:mt-20 mx-auto max-w-5xl animate-scale-fade-in opacity-0" style={{ animationDelay: "0.7s" }}>
              <div className="rounded-2xl glass p-1.5 shadow-2xl shadow-blue-500/10">
                <div className="rounded-xl bg-[#111118] overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="ml-4 flex-1 h-8 rounded-lg bg-white/[0.06] flex items-center px-3">
                      <Lock className="w-3 h-3 text-emerald-400 mr-2" />
                      <span className="text-xs text-white/40">app.storekriti.com/dashboard</span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="grid grid-cols-12 min-h-[300px] md:min-h-[380px]">
                    {/* Sidebar */}
                    <div className="col-span-3 border-r border-white/[0.06] p-3 hidden sm:block">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                          <Store className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white/80">Storekriti</span>
                      </div>
                      {[
                        { name: "Dashboard", active: true },
                        { name: "Stores", active: false },
                        { name: "Products", active: false },
                        { name: "Orders", active: false },
                        { name: "Analytics", active: false },
                        { name: "Settings", active: false },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-1 text-xs ${
                            item.active
                              ? "bg-white/[0.08] text-white font-medium"
                              : "text-white/30 hover:text-white/50"
                          }`}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>

                    {/* Main content area */}
                    <div className="col-span-12 sm:col-span-9 p-4 md:p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] text-white/30 uppercase tracking-wider">Welcome back</p>
                          <p className="text-sm font-semibold text-white/90 mt-0.5">Dashboard Overview</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                        </div>
                      </div>

                      {/* Metric cards */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: "Revenue", value: "₹2.4L", change: "+12%", up: true },
                          { label: "Orders", value: "348", change: "+8%", up: true },
                          { label: "Stores", value: "12", change: "+2", up: true },
                        ].map((m) => (
                          <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                            <p className="text-[10px] text-white/30">{m.label}</p>
                            <div className="flex items-end gap-2 mt-1">
                              <p className="text-lg font-bold text-white/90">{m.value}</p>
                              <span className="text-[10px] text-emerald-400 font-medium mb-0.5">{m.change}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chart */}
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 h-28 md:h-36 flex items-end gap-1.5">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-blue-500/40 to-blue-500/10 transition-all duration-300 hover:from-blue-500/60 hover:to-blue-500/20"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LOGO MARQUEE (Social Proof)
          Inspired by: Hyperzod marquee + Petpooja brand strip
      ═══════════════════════════════════════ */}
      <section className="py-10 md:py-14 border-b bg-muted/30">
        <div className="container mx-auto px-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Trusted by <span className="text-foreground font-semibold">10,000+</span> businesses across India
          </p>
        </div>
        <div className="marquee-mask overflow-hidden">
          <div className="flex animate-marquee" style={{ width: "max-content" }}>
            {[...TRUSTED_LOGOS, ...TRUSTED_LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex items-center justify-center mx-8 md:mx-12"
              >
                <div className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors">
                  <Store className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide whitespace-nowrap">{logo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ANIMATED STATS
          Inspired by: Squarespace counters + Petpooja stats
      ═══════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((s, i) => (
              <div key={s.label} ref={statRefs[i]} className="text-center">
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  {s.prefix}
                  {i === 1 ? statValues[i].toFixed(1) : Math.floor(statValues[i])}
                  <span className="bg-gradient-to-r from-blue-500 to-violet-500 text-gradient">
                    {s.suffix}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES
          Inspired by: Mintlify glass cards + Jungleworks hover-lift + Dukaan color-coded icons
      ═══════════════════════════════════════ */}
      <section id="features" className="py-16 md:py-24 px-4 relative">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="relative container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-18">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-blue-500/20 text-blue-600 bg-blue-500/5 mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 text-gradient">
                scale commerce
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              From store setup to analytics, every tool built for multi-tenant SaaS platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group hover-lift border bg-card/50 backdrop-blur-sm hover:border-primary/20 cursor-default"
              >
                <CardContent className="pt-6 pb-6">
                  <div
                    className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                  >
                    <f.icon className={`w-5 h-5 bg-gradient-to-br ${f.gradient} text-gradient`} style={{ WebkitTextFillColor: "unset", color: undefined }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRODUCT TOUR (Tabbed)
          Inspired by: Hyperzod progress-bar tabs + video sync
      ═══════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-emerald-500/20 text-emerald-600 bg-emerald-500/5 mb-4">
              Product Tour
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              See the platform in action
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              A complete commerce operating system, designed for scale.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Tab buttons with progress bars */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {PRODUCT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-foreground text-background shadow-lg"
                      : "bg-card border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-background/20 overflow-hidden">
                      <div className="h-full bg-background/60 tab-progress" key={tab.id} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  {activeTabData.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {activeTabData.desc}
                </p>
                <ul className="space-y-3">
                  {activeTabData.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 rounded-full" size="lg" asChild>
                  <PreloadLink to="/authentication">
                    Try it free <ArrowRight className="w-4 h-4 ml-2" />
                  </PreloadLink>
                </Button>
              </div>

              {/* Placeholder for product screenshot / illustration */}
              <div className="order-1 lg:order-2">
                <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-muted overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
                      <activeTabData.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{activeTabData.label} Preview</p>

                    {/* Mini dashboard mockup */}
                    <div className="mt-6 grid grid-cols-2 gap-3 max-w-xs mx-auto">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-16 rounded-lg bg-background/80 border" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
          Inspired by: Clean step pattern + Dashed connectors
      ═══════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-violet-500/20 text-violet-600 bg-violet-500/5 mb-4">
              How it works
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Go live in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create your store",
                desc: "Sign up, pick a template, and customize your brand — done in under 5 minutes.",
                icon: MousePointerClick,
              },
              {
                step: "02",
                title: "Add products & payments",
                desc: "Import your catalog, connect Razorpay, and configure delivery areas.",
                icon: CreditCard,
              },
              {
                step: "03",
                title: "Launch & grow",
                desc: "Go live with your domain, track analytics, and scale to thousands of tenants.",
                icon: ArrowUpRight,
              },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center group">
                {/* Step number with gradient */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <s.icon className="w-7 h-7 text-white" />
                </div>
                <div className="mt-2 text-xs font-bold text-muted-foreground/50 tracking-wider uppercase">
                  Step {s.step}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-96px)] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SOLUTIONS
          Inspired by: Gradient border cards (Jimdo) + Stat callouts
      ═══════════════════════════════════════ */}
      <section id="solutions" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-amber-500/20 text-amber-600 bg-amber-500/5 mb-4">
              Solutions
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Built for every commerce team
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="gradient-border hover-lift p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-violet-500 text-gradient">
                      {s.stat}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {s.statLabel}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
          Inspired by: Shopify social proof + Petpooja slider cards
      ═══════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-pink-500/20 text-pink-600 bg-pink-500/5 mb-4">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Loved by teams building commerce
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Rahul M.",
                role: "Agency Owner",
                quote:
                  "We launched 10+ client stores without chaos. The multi-tenant setup is incredibly smooth and our clients love the experience.",
                avatar: "R",
              },
              {
                name: "Priya S.",
                role: "SaaS Founder",
                quote:
                  "Billing and tenant management worked from day one. Saved us months of development and let us focus on growth.",
                avatar: "P",
              },
              {
                name: "Arjun K.",
                role: "Marketplace Lead",
                quote:
                  "Seller onboarding became predictable and fast. Our sellers love the clean admin experience and we scaled 3x in months.",
                avatar: "A",
              },
            ].map((t) => (
              <Card key={t.name} className="group hover-lift border bg-card">
                <CardContent className="pt-6 pb-6">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
          Inspired by: Jimdo gradient borders + Hostinger shimmer + Dukaan layout
      ═══════════════════════════════════════ */}
      <section id="pricing" className="py-16 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-emerald-500/20 text-emerald-600 bg-emerald-500/5 mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border bg-card hover-lift">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Free Trial</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-5xl font-bold tracking-tight">₹0</span>
                  <span className="text-muted-foreground ml-2">/ 7 days</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {[
                    "Full store functionality",
                    "Up to 10 products",
                    "Basic analytics",
                    "Email support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-full h-12" asChild>
                  <PreloadLink to="/authentication">Start Free Trial</PreloadLink>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan — gradient border */}
            <div className="gradient-border hover-lift relative">
              {/* Popular badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-full px-5 py-1 shadow-lg shadow-blue-500/20 border-0">
                  Most Popular
                </Badge>
              </div>
              <div className="p-6 pt-8">
                <div className="mb-1">
                  <h3 className="text-xl font-bold">Pro Plan</h3>
                  <p className="text-sm text-muted-foreground">For growing businesses</p>
                </div>
                <div className="my-6">
                  <span className="text-5xl font-bold tracking-tight">₹1</span>
                  <span className="text-muted-foreground ml-2">/ month</span>
                </div>
                <ul className="space-y-3.5 mb-8">
                  {[
                    "Unlimited products",
                    "Advanced analytics",
                    "Priority support",
                    "Custom domain",
                    "Remove branding",
                    "API access",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full rounded-full h-12 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0 shadow-lg shadow-blue-500/20"
                  asChild
                >
                  <PreloadLink to="/authentication">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </PreloadLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
          Inspired by: Accordion pattern + Clean typography
      ═══════════════════════════════════════ */}
      <section id="faq" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium border-sky-500/20 text-sky-600 bg-sky-500/5 mb-4">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((f, i) => (
              <div
                key={i}
                className="border rounded-xl bg-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/30 transition-colors"
                >
                  <span className="text-sm font-semibold pr-4">{f.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          Inspired by: Framer dark CTA + Hyperzod gradient mesh
      ═══════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-[#0a0a0f] p-12 md:p-20">
            {/* Gradient blobs */}
            <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/20 blur-[80px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-violet-600/15 blur-[60px]" />

            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Ready to build your
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-violet-400 text-gradient">
                  commerce platform?
                </span>
              </h2>
              <p className="mt-5 text-white/50 max-w-lg mx-auto text-lg">
                Join teams building modern multi-tenant ecommerce with Storekriti.
                Start your free trial today.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="h-13 px-8 rounded-full bg-white text-[#0a0a0f] hover:bg-white/90 font-semibold text-base shadow-lg shadow-white/10"
                  asChild
                >
                  <PreloadLink to="/authentication">
                    Get started free <ArrowRight className="w-4 h-4 ml-2" />
                  </PreloadLink>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 rounded-full border-white/15 text-white hover:bg-white/[0.06] bg-transparent font-medium"
                  asChild
                >
                  <PreloadLink to="/contact">Contact sales</PreloadLink>
                </Button>
              </div>
              <p className="mt-5 text-sm text-white/25">
                No credit card required &middot; 7-day free trial &middot; Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
