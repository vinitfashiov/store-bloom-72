import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  CreditCard,
  Check,
  Users,
  BarChart3,
  Sparkles,
  Boxes,
  Building2,
  Lock,
  LifeBuoy,
  Laptop,
  Plug,
  Workflow,
  Quote,
  ChevronRight,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow" />
                <div className="absolute inset-0 w-10 h-10 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="leading-none">
                <div className="text-lg font-display font-bold tracking-tight">Storekriti</div>
                <div className="text-[11px] text-muted-foreground">B2B ecommerce website builder</div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition">
                Features
              </a>
              <a href="#solutions" className="hover:text-foreground transition">
                Solutions
              </a>
              <a href="#security" className="hover:text-foreground transition">
                Security
              </a>
              <a href="#pricing" className="hover:text-foreground transition">
                Pricing
              </a>
              <a href="#faq" className="hover:text-foreground transition">
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/authentication">Log In</Link>
              </Button>
              <Button asChild className="shadow-glow">
                <Link to="/authentication">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.22),transparent_48%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_78%,hsl(var(--accent)/0.16),transparent_52%)]" />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="py-16 md:py-24 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="px-3">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Launch faster
                  </Badge>
                  <Badge variant="outline" className="px-3 bg-background/40 backdrop-blur">
                    Multi-tenant • B2B SaaS-ready
                  </Badge>
                </div>

                <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.05]">
                  Build & scale
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    ecommerce stores
                  </span>{" "}
                  for clients
                </h1>

                <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-xl">
                  Storekriti is a{" "}
                  <span className="text-foreground/90 font-medium">B2B ecommerce website builder SaaS</span> to create,
                  manage, and monetize multiple stores with tenant isolation, payments, analytics, and a modern admin
                  panel.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Button asChild size="lg" className="shadow-glow text-base px-8 py-6">
                    <Link to="/authentication">
                      Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-6 bg-background/50 backdrop-blur"
                  >
                    <Link to="/authentication">
                      Book a demo <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 text-xs sm:text-sm text-muted-foreground">
                  7-day free trial • No credit card required • Cancel anytime
                </div>

                {/* Trust Row */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                  {[
                    { k: "99.9%", v: "Uptime target" },
                    { k: "Razorpay", v: "Payments" },
                    { k: "RBAC", v: "Teams & roles" },
                    { k: "Isolated", v: "Tenants & data" },
                  ].map((i) => (
                    <div key={i.k} className="rounded-xl border bg-background/45 backdrop-blur px-4 py-3">
                      <div className="font-display font-bold tracking-tight">{i.k}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{i.v}</div>
                    </div>
                  ))}
                </div>

                {/* Logos strip */}
                <div className="mt-10">
                  <div className="text-xs text-muted-foreground mb-3">Trusted by teams building modern commerce</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 opacity-80">
                    {["Nova", "Brick", "Pine", "Orbit", "Kite", "Atlas"].map((b) => (
                      <div
                        key={b}
                        className="rounded-lg border bg-background/40 backdrop-blur px-3 py-2 text-center text-xs text-muted-foreground"
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Product preview */}
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-primary/15 to-accent/15 blur-2xl" />
                <div className="relative rounded-[2rem] border bg-background/55 backdrop-blur p-5 shadow-glow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                        <Laptop className="w-4.5 h-4.5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-display font-semibold tracking-tight">Admin Console</div>
                        <div className="text-xs text-muted-foreground">Multi-store dashboard</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-background/60">
                      Live Preview
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-12 gap-4">
                    {/* Left mini nav */}
                    <div className="col-span-5 sm:col-span-4 rounded-2xl border bg-muted/20 p-4">
                      <div className="text-xs text-muted-foreground mb-3">Workspace</div>
                      <div className="space-y-2">
                        {[
                          { icon: Boxes, label: "Stores" },
                          { icon: BarChart3, label: "Analytics" },
                          { icon: CreditCard, label: "Payments" },
                          { icon: Users, label: "Customers" },
                          { icon: Plug, label: "Integrations" },
                          { icon: Workflow, label: "Automations" },
                        ].map((i) => (
                          <div
                            key={i.label}
                            className="flex items-center gap-2 rounded-xl border bg-background/50 px-3 py-2 text-sm"
                          >
                            <i.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{i.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main panel */}
                    <div className="col-span-7 sm:col-span-8 rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">Store overview</div>
                          <div className="text-xs text-muted-foreground">Today’s performance</div>
                        </div>
                        <Badge className="gradient-primary text-primary-foreground border-0">+12% MoM</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {[
                          { t: "Orders", v: "1,248" },
                          { t: "Revenue", v: "₹8.2L" },
                          { t: "Conversion", v: "2.9%" },
                          { t: "Active stores", v: "38" },
                        ].map((m) => (
                          <div key={m.t} className="rounded-xl border bg-background/55 px-4 py-3">
                            <div className="text-xs text-muted-foreground">{m.t}</div>
                            <div className="mt-1 text-lg font-display font-bold tracking-tight">{m.v}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-xl border bg-background/55 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Top stores</div>
                          <div className="text-xs text-muted-foreground">Last 7 days</div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {[
                            { name: "FreshMart", pct: "34%" },
                            { name: "UrbanGrocery", pct: "26%" },
                            { name: "StyleNest", pct: "19%" },
                          ].map((s) => (
                            <div
                              key={s.name}
                              className="flex items-center justify-between rounded-lg border bg-muted/10 px-3 py-2"
                            >
                              <div className="text-sm">{s.name}</div>
                              <div className="text-xs text-muted-foreground">{s.pct}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 rounded-xl border bg-background/55 p-4">
                          <div className="text-xs text-muted-foreground mb-2">Security</div>
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-600" />
                            <div className="text-sm">Tenant isolation enabled</div>
                          </div>
                        </div>
                        <div className="flex-1 rounded-xl border bg-background/55 p-4">
                          <div className="text-xs text-muted-foreground mb-2">Compliance</div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <div className="text-sm">Audit-ready logging</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-background/60">
                      Multi-tenant
                    </Badge>
                    <Badge variant="outline" className="bg-background/60">
                      Custom domains
                    </Badge>
                    <Badge variant="outline" className="bg-background/60">
                      Razorpay
                    </Badge>
                    <Badge variant="outline" className="bg-background/60">
                      Analytics
                    </Badge>
                    <Badge variant="outline" className="bg-background/60">
                      Role-based access
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4" variant="outline">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Built for B2B SaaS commerce builders
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Launch tenant stores, manage subscriptions, handle payments, and scale confidently with enterprise-grade
              architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant onboarding",
                desc: "Spin up a tenant store, theme, catalog, and payments in minutes—guided and repeatable.",
                tone: "bg-primary/10 text-primary",
              },
              {
                icon: Globe,
                title: "Multi-tenant by default",
                desc: "Data separation, isolated configs, and per-tenant custom domains—made to scale safely.",
                tone: "bg-accent/10 text-accent",
              },
              {
                icon: Shield,
                title: "Security & auditability",
                desc: "Role-based access, activity logs, and secure defaults for serious businesses.",
                tone: "bg-emerald-500/10 text-emerald-600",
              },
              {
                icon: CreditCard,
                title: "Payments + subscriptions",
                desc: "Razorpay checkout, webhooks, retries, invoicing-ready flows for SaaS monetization.",
                tone: "bg-amber-500/10 text-amber-600",
              },
              {
                icon: Plug,
                title: "Integrations",
                desc: "Connect shipping, email, WhatsApp, analytics, and more through a clean integration layer.",
                tone: "bg-sky-500/10 text-sky-600",
              },
              {
                icon: BarChart3,
                title: "Analytics dashboard",
                desc: "Store-level + platform-level analytics to track growth, revenue, and retention.",
                tone: "bg-violet-500/10 text-violet-600",
              },
            ].map((f) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden border bg-background/70 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-muted/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-8">
                  <div
                    className={`w-14 h-14 rounded-2xl ${f.tone} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
                  >
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security strip */}
          <div id="security" className="mt-12 rounded-2xl border bg-muted/20 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Security by design
                </div>
                <h3 className="mt-3 text-2xl font-display font-bold tracking-tight">
                  Isolated tenants. Protected customer data.
                </h3>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                  Separate data per tenant, protect admin access with roles, and keep every action traceable with
                  logs—ready for serious scale.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { icon: Lock, label: "Tenant isolation" },
                    { icon: Users, label: "RBAC" },
                    { icon: Shield, label: "Audit logs" },
                    { icon: Building2, label: "Custom domains" },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground"
                    >
                      <b.icon className="w-3.5 h-3.5" />
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button asChild className="shadow-glow">
                <Link to="/authentication">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Use cases */}
      <section id="solutions" className="py-20 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4" variant="outline">
              Solutions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              Built for agencies, founders, and platforms
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you build stores for clients or run a vertical marketplace—Storekriti gives you the backbone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                title: "Agencies",
                desc: "Launch multiple client stores fast, manage them centrally, and bill subscriptions.",
              },
              {
                icon: Boxes,
                title: "SaaS founders",
                desc: "Offer a store-builder product with pricing tiers, add-ons, and analytics from day one.",
              },
              {
                icon: Store,
                title: "Vertical marketplaces",
                desc: "Onboard sellers/tenants quickly with isolated catalogs, themes, and payments.",
              },
            ].map((s) => (
              <Card key={s.title} className="border bg-background/70 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="font-display">{s.title}</CardTitle>
                  <CardDescription>{s.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Multi-tenant-ready workflows
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Central billing and analytics
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Custom domains & branding
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Shreya • Agency owner",
                quote:
                  "We went from 2 stores/month to 15+ with the same team. The tenant setup flow is clean and repeatable.",
              },
              {
                name: "Aman • SaaS founder",
                quote: "Pricing tiers + analytics helped us monetize quickly. The architecture feels built for scale.",
              },
              {
                name: "Rohit • Marketplace lead",
                quote: "Onboarding sellers became painless. Isolated stores + payments in one platform is a big win.",
              },
            ].map((t) => (
              <Card key={t.name} className="border bg-background/70 backdrop-blur">
                <CardContent className="pt-6">
                  <Quote className="w-5 h-5 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.quote}</p>
                  <div className="mt-4 text-sm font-medium">{t.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4" variant="outline">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free. Upgrade when you scale. Built for SaaS commerce builders.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="relative border bg-background/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold">Starter</CardTitle>
                <CardDescription>For testing and early MVP</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold tracking-tight">₹0</span>
                  <span className="text-muted-foreground"> / 7 days</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {["1 tenant store", "Up to 25 products", "Basic analytics", "Email support"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/authentication">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="relative border-primary/50 shadow-glow bg-background/70 backdrop-blur">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="gradient-primary text-primary-foreground border-0">Most Popular</Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold">Pro</CardTitle>
                <CardDescription>For growing teams & agencies</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold tracking-tight">₹1</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited products",
                    "Multiple tenant stores",
                    "Advanced analytics",
                    "Custom domains",
                    "Remove branding",
                    "API access",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full shadow-glow">
                  <Link to="/authentication">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative border bg-background/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold">Enterprise</CardTitle>
                <CardDescription>For large platforms</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold tracking-tight">Custom</span>
                  <span className="text-muted-foreground"> / pricing</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Dedicated infrastructure options",
                    "SSO / advanced auth (optional)",
                    "SLA + priority support",
                    "Audit exports & compliance needs",
                    "Custom integrations",
                    "Security reviews",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/authentication">Talk to sales</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support strip */}
          <div className="mt-10 max-w-6xl mx-auto rounded-2xl border bg-muted/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-semibold tracking-tight">Need help migrating or launching?</div>
                  <div className="text-sm text-muted-foreground">
                    We can help with onboarding, themes, and Razorpay integration.
                  </div>
                </div>
              </div>
              <Button asChild className="shadow-glow">
                <Link to="/authentication">
                  Book a demo <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4" variant="outline">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Questions, answered</h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Storekriti.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[
              {
                q: "Is this a website builder or a full SaaS platform?",
                a: "It’s a SaaS platform: multi-tenant stores, admin console, payments, analytics, and workflows to run many stores at scale.",
              },
              {
                q: "Can each tenant use a custom domain?",
                a: "Yes. Tenants can map custom domains, and you can also keep a platform domain for quick onboarding.",
              },
              {
                q: "How do you handle tenant isolation?",
                a: "Architecture supports isolated tenant data and configurations. You can enforce access via RBAC and audit logs.",
              },
              {
                q: "Do you support Razorpay?",
                a: "Yes. Razorpay checkout + webhook-friendly payment flows are built-in for ecommerce and subscriptions.",
              },
            ].map((f) => (
              <Card key={f.q} className="border bg-background/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base font-display font-semibold">{f.q}</CardTitle>
                  <CardDescription className="text-sm">{f.a}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto rounded-3xl border bg-muted/20 px-6 md:px-10 py-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

            <Badge className="mb-4" variant="secondary">
              <Zap className="w-3.5 h-3.5 mr-1" /> Ready when you are
            </Badge>

            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
              Launch your B2B ecommerce builder SaaS
            </h2>
            <p className="mt-4 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Build stores for clients, manage subscriptions, and scale with multi-tenant architecture.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="shadow-glow text-base px-10 py-6">
                <Link to="/authentication">
                  Start Your Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base px-10 py-6 bg-background/50 backdrop-blur"
              >
                <Link to="/authentication">Book a demo</Link>
              </Button>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">No credit card required • Cancel anytime</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <Store className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="leading-none">
                <div className="font-display font-semibold tracking-tight">Storekriti</div>
                <div className="text-[11px] text-muted-foreground">Built for modern B2B commerce</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition">
                Features
              </a>
              <a href="#pricing" className="hover:text-foreground transition">
                Pricing
              </a>
              <a href="#faq" className="hover:text-foreground transition">
                FAQ
              </a>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2026 Storekriti. Owned and Operated by: Shailendra Singh.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
