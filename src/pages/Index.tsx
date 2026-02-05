import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Star,
  Sparkles,
  Check,
  Menu,
  X,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/shared/SEOHead';

// Brand logos for marquee
const brandLogos = [
  'Shopify', 'Razorpay', 'Shiprocket', 'Meta', 'Google', 'PayTM', 'PhonePe', 'Stripe'
];

// Stats data
const stats = [
  { value: '22', suffix: '%', title: 'Enhanced Conversions', description: 'StoreKriti boosts conversions and enhances the quality of each sale.' },
  { value: '40', suffix: '%', title: 'Reduced RTO Rates', description: 'Using our platform, brands have improved Return-to-Origin rates significantly.' },
  { value: '48', suffix: '%', title: 'Improved Prepaid Share', description: 'Our checkout increases prepaid orders by optimizing trust and speed.' },
];

// Features data
const features = [
  {
    title: 'OTP Authentication & Pre-Filled Addresses',
    description: 'Elevate your checkout experience with OTP authentication for security and instant address fill to speed up transactions. Combat RTO issues, and make every sale seamless.',
    stat: '30% of e-commerce deliveries face Return To Origin (RTO) challenges.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
    reverse: false,
  },
  {
    title: 'Dynamic Couponing & AI Upselling',
    description: 'Maximize AOV with dynamic couponing and smart upselling. Offer personalized promotions and recommendations to enhance customer satisfaction.',
    stat: '92% of online shoppers search for a coupon before completing purchase.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
    reverse: true,
  },
  {
    title: 'Prepaid Incentives & COD Optimization',
    description: 'Boost prepaid purchases and manage COD efficiently with discounts and surcharges, optimizing your revenue and operational flow.',
    stat: 'E-commerce brands report COD share over 65%.',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=400&fit=crop',
    reverse: false,
  },
];

// Testimonials
const testimonials = [
  {
    quote: "StoreKriti has greatly improved our operations by reducing COD orders with Partial COD and boosting prepaid ones. They've enabled efficient scaling, and the team's support has made a strong business impact.",
    author: 'Rahul Sharma',
    role: 'Co-Founder & MD',
    company: 'Fashion Brand',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    large: true,
  },
  {
    quote: "StoreKriti has transformed our checkout process with a smooth, customizable experience. Their support is exceptional.",
    author: 'Priya Patel',
    role: 'Founder & CEO',
    company: 'Home Decor Store',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    quote: "StoreKriti promised a customized checkout and higher prepaid share—and delivered within four months. Support and expertise were key.",
    author: 'Amit Kumar',
    role: 'Founder',
    company: 'Electronics Store',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  },
];

// Reviews
const reviews = [
  { text: "The checkout is fast, clean, and conversion-friendly. COD optimizations saved us a ton of RTO cost.", role: 'Operations Lead', company: 'D2C Brand' },
  { text: "OTP + Address autofill made checkout frictionless. Prepaid share jumped noticeably in weeks.", role: 'Growth Manager', company: 'Online Store' },
  { text: "Support is fast and practical. Integrations and tracking helped our team move quickly.", role: 'Founder', company: 'D2C Commerce' },
];

// FAQ data
const faqs = [
  { q: 'What does StoreKriti cost?', a: 'Pricing depends on volume and features. We offer flexible plans—schedule a demo for an exact quote.' },
  { q: 'Is StoreKriti a payment gateway?', a: 'No. StoreKriti is a complete e-commerce platform that works with your payment gateway(s). It improves conversion, prepaid share, and reduces RTO with smarter flows.' },
  { q: 'Do I need technical skills to use StoreKriti?', a: 'Not at all! StoreKriti is designed for non-technical users. Our intuitive interface lets you build and manage your store without any coding.' },
];

// Integration badges
const integrations = [
  'Shopify', 'Razorpay', 'Shiprocket', 'Meta', 'Google', 'Webhooks', 'SMS/OTP', 'UPI', 'COD Rules', 'Coupons', 'Analytics', 'CRM'
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <SEOHead 
        title="StoreKriti — Checkout That Converts"
        description="Skyrocket your sales with the innovative checkout suite that provides a faster, smoother, and wiser checkout experience."
      />
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Manrope', ui-sans-serif, system-ui, sans-serif" }}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">StoreKriti</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Home</Link>
                <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Features</Link>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Pricing</Link>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">About Us</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Contact Us</Link>
              </div>

              {/* CTA */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/auth">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 text-sm font-medium shadow-lg shadow-violet-200/50">
                    Schedule a demo
                  </Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
              <div className="flex flex-col gap-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
                <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium">About Us</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact Us</Link>
                <Link to="/auth">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full w-full">
                    Schedule a demo
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section - FlexyPe Style */}
        <section className="pt-24 pb-8 md:pt-32 md:pb-16 overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #e8f4fc 0%, #e5f7f3 50%, #f0faf5 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/90 text-gray-700 rounded-full px-5 py-2.5 text-sm font-medium mb-8 shadow-sm border border-gray-100">
                <span>🚀</span>
                <span>Presenting StoreKriti</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-[#1a2b4a] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Simple{' '}
                <span className="relative inline-flex items-baseline">
                  <span className="bg-gradient-to-r from-[#0066cc] via-[#0088dd] to-[#00aaee] bg-clip-text text-transparent">
                    1 click
                  </span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[#0077cc] ml-0.5 -mt-4 absolute -right-5 -top-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                  </svg>
                </span>
                <br />
                Checkout That Converts
              </h1>

              {/* Subheadline */}
              <p className="text-base md:text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed font-normal">
                Skyrocket your sales with the innovative checkout suite that provides a faster, smoother, and wiser checkout experience.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link to="/auth">
                  <Button size="lg" className="bg-[#1a2b4a] hover:bg-[#0f1d33] text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5">
                    Talk to us
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
                  How it works
                </Button>
              </div>

              {/* Dashboard Preview */}
              <div className="relative max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-2xl shadow-gray-300/40 border border-gray-200 overflow-hidden">
                  <img 
                    src="/dashboard.png"
                    alt="Dashboard Preview"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=700&fit=crop";
                    }}
                  />
                  {/* Play button overlay */}
                  <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
                    <button className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full pl-4 pr-6 py-3 shadow-xl hover:scale-105 transition-transform group border border-gray-100">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-700 ml-0.5" fill="currentColor" />
                      </div>
                      <span className="font-semibold text-gray-700">Play</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Marquee */}
        <section className="py-16 bg-slate-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Partnered with the Best</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">Trusted By Industry Leading Brands</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
                StoreKriti powers the checkout for industry leaders, offering seamless checkout and unmatched reliability.
              </p>
            </div>

            <div className="overflow-hidden">
              <div className="animate-marquee flex gap-16 whitespace-nowrap">
                {[...brandLogos, ...brandLogos].map((brand, i) => (
                  <div key={i} className="flex-shrink-0 h-12 flex items-center justify-center px-6">
                    <span className="text-xl font-bold text-gray-300 hover:text-gray-400 transition-colors">{brand}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Success Snapshots</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">How StoreKriti has revolutionised D2C checkouts</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
                Streamlined checkouts, elevated conversions. Transforming clicks into customers, effortlessly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-gray-100 text-center hover:shadow-xl hover:shadow-gray-100/50 transition-all hover:-translate-y-1">
                  <div className="text-5xl md:text-6xl font-extrabold text-violet-600 mb-2">
                    {stat.value}<span className="text-3xl">{stat.suffix}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{stat.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Feature Highlights</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Advanced Features for Enhanced Checkout Performance</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
                Unlock lightning-fast sales with one-tap authentication and instant address fill, crafted for peak performance.
              </p>
            </div>

            <div className="space-y-24">
              {features.map((feature, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-16`}
                >
                  {/* Image */}
                  <div className="flex-1 w-full">
                    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">{feature.description}</p>
                    
                    <div className="flex items-start gap-3 bg-violet-50 rounded-xl p-4 mb-6 border border-violet-100">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-violet-600" />
                      </div>
                      <p className="text-gray-600 text-sm">{feature.stat}</p>
                    </div>

                    <Button variant="link" className="text-violet-600 hover:text-violet-700 p-0 font-semibold text-sm">
                      Learn More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link to="/auth">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 h-12 font-semibold shadow-xl shadow-violet-300/40">
                  Skyrocket Your Checkout
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Integration</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Seamless Sync with Your Favorite Tools</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
                Maximize efficiency with StoreKriti's seamless integrations. Connect your favorite tools, streamline your workflow.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {integrations.map((integration, i) => (
                <span 
                  key={i}
                  className="bg-slate-100 text-gray-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-violet-100 hover:text-violet-700 transition-colors cursor-pointer"
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Voices of Trust</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Client Success Stories</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
                Real feedback from our partners — see how StoreKriti has transformed their businesses.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Large testimonial */}
              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-100/50 border border-gray-100 md:row-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonials[0].image}
                      alt={testimonials[0].author}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-violet-50"
                    />
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-gray-600 text-lg leading-relaxed mb-6">
                    "{testimonials[0].quote}"
                  </blockquote>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonials[0].author}</div>
                  <div className="text-gray-400 text-sm">{testimonials[0].role} of {testimonials[0].company}</div>
                </div>
              </div>

              {/* Smaller testimonials */}
              {testimonials.slice(1).map((testimonial, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-100/50 border border-gray-100">
                  <blockquote className="text-gray-600 mb-5 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{testimonial.author}</div>
                      <div className="text-gray-400 text-xs">{testimonial.role} of {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/auth">
                <Button variant="outline" className="rounded-full px-8 border-gray-300 hover:bg-gray-50 font-medium">
                  Simplify Checkout
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Voices of Experience</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">What Our Clients Say</h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
                Hear directly from our customers about their experience partnering with StoreKriti.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-5 text-sm leading-relaxed">"{review.text}"</p>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{review.role}</div>
                    <div className="text-gray-400 text-xs">{review.company}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/auth">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 font-medium">
                  Boost Revenue
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <span className="text-violet-600 font-semibold text-xs uppercase tracking-widest">Support</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">FAQ: Your Questions, Answered</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  Find quick answers to common queries and get clarity on how StoreKriti can work for you.
                </p>
                <Link to="/contact">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 font-medium">
                    Get Answers
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div 
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="w-5 h-5 text-violet-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Redefine the Checkout
            </h2>
            <p className="text-violet-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Tap into the power of StoreKriti and let's transform your customer's journey together. It's time to lead the charge in D2C commerce.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-violet-600 hover:bg-gray-100 rounded-full px-8 h-12 font-semibold shadow-xl">
                  Get Started
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-full px-8 h-12 font-semibold backdrop-blur-sm">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-10">
              {/* Brand */}
              <div className="md:col-span-1">
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold">StoreKriti</span>
                </Link>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Streamlining your checkout experience with cutting-edge, one-click solution that converts.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482A13.944 13.944 0 0 1 1.671 3.149a4.916 4.916 0 0 0 1.523 6.574 4.897 4.897 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 0 1-2.224.084 4.918 4.918 0 0 0 4.6 3.419A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.025 10.025 0 0 0 24 4.557z"/></svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                  </a>
                </div>
              </div>

              {/* Menu */}
              <div>
                <h4 className="font-semibold mb-4 text-sm">Menu</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/help" className="hover:text-white transition-colors">FAQs</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold mb-4 text-sm">Company</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4 text-sm">Contact</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-violet-400" />
                    hello@storekriti.com
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
              Copyright © 2025 StoreKriti | All Rights Reserved
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
