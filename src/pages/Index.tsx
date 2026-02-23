import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Launch in minutes",
    desc: "Guided onboarding, templates, and instant store setup — no coding required.",
  },
  {
    icon: Globe,
    title: "Multi-tenant architecture",
    desc: "Isolated stores with data separation, scaling safely for thousands of tenants.",
  },
  {
    icon: Shield,
    title: "Security by design",
    desc: "RBAC, audit logs, and best-practice defaults to protect customer data.",
  },
  {
    icon: CreditCard,
    title: "Payments & billing",
    desc: "Razorpay-ready checkout and subscription billing for SaaS monetization.",
  },
  {
    icon: Users,
    title: "Customer management",
    desc: "Orders, customers, retention, and operational workflows in one place.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Store-level and platform-level insights to optimize growth and revenue.",
  },
];

const SOLUTIONS = [
  {
    icon: Boxes,
    title: "Agency / Studio",
    desc: "Manage multiple client stores from a single dashboard with white-label branding.",
  },
  {
    icon: Store,
    title: "SaaS Founders",
    desc: "Ship a store-builder product with tiers, add-ons, and analytics on day one.",
  },
  {
    icon: Workflow,
    title: "Vertical Marketplaces",
    desc: "Onboard sellers faster with isolated catalogs, themes, and payment setup.",
  },
];

const STATS = [
  { value: "10K+", label: "Stores created" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 1s", label: "Avg load time" },
  { value: "24/7", label: "Support" },
];

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
];

export default function Index() {
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
    <div className="bg-background text-foreground">
      <SEOHead
        title="Storekriti – India's D2C Ecommerce Store Builder"
        description="Create your online store in minutes with Storekriti. Launch, manage and grow your ecommerce or grocery business with zero coding."
        canonicalUrl="https://storekriti.com"
        schema={schema}
      />

      {/* ═══════════════════════════════
          HERO
      ═══════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,hsl(160_60%_30%/0.5),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,hsl(160_40%_15%/0.4),transparent_60%)]" />

        <div className="relative container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
          <Badge className="rounded-full bg-white/10 text-white/90 border-white/15 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Multi-tenant ecommerce platform
          </Badge>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Build stores that
            <br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              scale with you
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">
            Launch, manage, and grow multi-tenant ecommerce stores with speed, security, and an admin experience your customers will love.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow-lg shadow-black/20"
              asChild
            >
              <PreloadLink to="/authentication">
                Start free trial <ArrowRight className="w-4 h-4 ml-2" />
              </PreloadLink>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5"
              asChild
            >
              <PreloadLink to="/pricing">View pricing</PreloadLink>
            </Button>
          </div>

          <p className="mt-4 text-sm text-emerald-200/50">
            7-day free trial · No credit card required
          </p>

          {/* Dashboard Preview */}
          <div className="mt-12 md:mt-16 mx-auto max-w-5xl">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-1.5 shadow-2xl shadow-black/30">
              <div className="rounded-lg bg-white overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-neutral-50">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-3 flex-1 h-7 rounded-md bg-neutral-100 flex items-center px-3">
                    <span className="text-xs text-neutral-400">app.storekriti.com/dashboard</span>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="grid grid-cols-12 min-h-[280px] md:min-h-[340px]">
                  {/* Sidebar */}
                  <div className="col-span-3 border-r bg-neutral-50/80 p-3 hidden sm:block">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <Store className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-700">Storekriti</span>
                    </div>
                    {["Dashboard", "Stores", "Products", "Orders", "Analytics", "Settings"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 mb-1 text-xs ${
                            i === 0
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-neutral-500 hover:bg-neutral-100"
                          }`}
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>

                  {/* Main content */}
                  <div className="col-span-12 sm:col-span-9 p-4 md:p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs text-neutral-400">Welcome back</p>
                        <p className="text-sm font-semibold text-neutral-800">Dashboard Overview</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Live</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: "Revenue", value: "₹2.4L" },
                        { label: "Orders", value: "348" },
                        { label: "Stores", value: "12" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border bg-white p-3">
                          <p className="text-[10px] text-neutral-400">{stat.label}</p>
                          <p className="text-lg font-bold text-neutral-800 mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart placeholder */}
                    <div className="rounded-lg border bg-neutral-50/50 p-3 h-24 md:h-32 flex items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-emerald-500/20 rounded-t"
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
      </section>

      {/* ═══════════════════════════════
          STATS STRIP
      ═══════════════════════════════ */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FEATURES
      ═══════════════════════════════ */}
      <section id="features" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">Features</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to scale commerce
            </h2>
            <p className="mt-3 text-muted-foreground">
              From store setup to analytics, every tool built for multi-tenant SaaS platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group border bg-card hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <f.icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-muted/25">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Go live in three simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create your store",
                desc: "Sign up, pick a template, and customize your brand — done in under 5 minutes.",
              },
              {
                step: "02",
                title: "Add products & payments",
                desc: "Import your catalog, connect Razorpay, and configure delivery areas.",
              },
              {
                step: "03",
                title: "Launch & grow",
                desc: "Go live with your domain, track analytics, and scale to thousands of tenants.",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-600/25">
                  {s.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-emerald-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          SOLUTIONS
      ═══════════════════════════════ */}
      <section id="solutions" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
              Built for
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Commerce solutions for every team
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SOLUTIONS.map((s) => (
              <Card
                key={s.title}
                className="group border bg-card hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <CardHeader>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <s.icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <CardTitle className="mt-3">{s.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{s.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 bg-muted/25">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Loved by teams building commerce
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Rahul M.",
                role: "Agency Owner",
                quote: "We launched 10+ client stores without chaos. The multi-tenant setup is incredibly smooth.",
              },
              {
                name: "Priya S.",
                role: "SaaS Founder",
                quote: "Billing and tenant management worked from day one. Saved us months of development.",
              },
              {
                name: "Arjun K.",
                role: "Marketplace Lead",
                quote: "Seller onboarding became predictable and fast. Our sellers love the clean admin experience.",
              },
            ].map((t) => (
              <Card key={t.name} className="border bg-card">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          PRICING
      ═══════════════════════════════ */}
      <section id="pricing" className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">Pricing</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Free Trial</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold tracking-tight">₹0</span>
                  <span className="text-muted-foreground ml-1">/ 7 days</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Full store functionality", "Up to 10 products", "Basic analytics", "Email support"].map(
                    (f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    )
                  )}
                </ul>
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <PreloadLink to="/authentication">Start Free Trial</PreloadLink>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 bg-card shadow-lg shadow-emerald-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white rounded-full px-4">Most Popular</Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-xl font-bold">Pro Plan</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold tracking-tight">₹1</span>
                  <span className="text-muted-foreground ml-1">/ month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited products",
                    "Advanced analytics",
                    "Priority support",
                    "Custom domain",
                    "Remove branding",
                    "API access",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700" asChild>
                  <PreloadLink to="/authentication">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </PreloadLink>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FAQ
      ═══════════════════════════════ */}
      <section id="faq" className="py-16 md:py-24 px-4 bg-muted/25">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-sm font-medium text-emerald-600 tracking-wide uppercase">FAQ</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {FAQ.map((f) => (
              <Card key={f.q} className="border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold leading-snug">{f.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FINAL CTA
      ═══════════════════════════════ */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-800 p-10 md:p-16 shadow-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Ready to build your commerce platform?
            </h2>
            <p className="mt-4 text-emerald-100/70 max-w-lg mx-auto">
              Join teams building modern multi-tenant ecommerce with Storekriti. Start your free trial today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-semibold"
                asChild
              >
                <PreloadLink to="/authentication">
                  Get started free <ArrowRight className="w-4 h-4 ml-2" />
                </PreloadLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/10 bg-white/5"
                asChild
              >
                <PreloadLink to="/contact">Contact sales</PreloadLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
