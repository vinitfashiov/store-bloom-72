# 🌐 Custom Domain System Analysis & Solutions Report

**Generated:** January 30, 2026  
**System:** Storekriti - Multi-Tenant E-commerce Platform  
**Status:** ⚠️ REQUIRES CONFIGURATION CHANGES

---

## 📊 Current System Analysis

### How The Current System Works

```
User Adds Domain    →    DNS Verification    →    Domain Activation
      ↓                        ↓                        ↓
custom_domains table    verify-domain-dns      status = 'active'
(status: pending)       Edge Function             ↓
                             ↓                Frontend Resolution
                        Check A Record        CustomDomainContext
                        (185.158.133.1)              ↓
                                              Load Store
```

### Architecture Components

| Component | File | Purpose |
|-----------|------|---------|
| Database Table | `supabase/migrations/20251223004647_*.sql` | Stores domain → tenant mapping |
| DNS Verifier | `supabase/functions/verify-domain-dns/index.ts` | Checks if domain points to expected IP |
| Admin UI | `src/pages/admin/AdminDomains.tsx` | Add/remove/verify domains |
| Frontend Resolver | `src/contexts/CustomDomainContext.tsx` | Detect & resolve custom domains |
| Route Handler | `src/components/CustomDomainRoutes.tsx` | Render store on custom domain |

### Database Schema

```sql
custom_domains (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  domain TEXT UNIQUE NOT NULL,          -- e.g., "shop.example.com"
  status TEXT DEFAULT 'pending',        -- 'pending' | 'active'
  created_at TIMESTAMP
)
```

---

## ❌ WHY DNS IS NOT CONNECTING - ROOT CAUSE

### The Problem

The current system expects users to create an **A record** pointing to:

```
Type: A
Name: @ (or subdomain)
Value: 185.158.133.1
```

**THIS DOES NOT WORK BECAUSE:**

1. **Wrong IP Address**: The IP `185.158.133.1` is a placeholder/static IP that doesn't actually route to your hosting infrastructure

2. **Hosting Platform Mismatch**: Your app is hosted on **Lovable.dev** platform, which uses their own dynamic infrastructure (not a static IP)

3. **No Server at That IP**: There's no server at `185.158.133.1` that:
   - Accepts HTTPS connections
   - Has SSL certificates for custom domains
   - Routes traffic to your Supabase-backed app

4. **SSL/TLS Issue**: Even if DNS resolves correctly, there's no SSL termination configured for custom domains

### The Flow That Breaks

```
User configures DNS → Domain points to 185.158.133.1 → NOTHING THERE!
                                                         ↓
                                                    Connection fails
                                                    SSL error
                                                    Site unreachable
```

---

## ✅ SOLUTION OPTIONS (Simplest to Most Complex)

### 🌟 OPTION 1: Subdomain-Only Approach (RECOMMENDED - SIMPLEST)

**Complexity: ⭐ Easy**  
**Cost: FREE**  
**Setup Time: 1 hour**

Instead of custom domains, offer subdomains like:
- `yourstore.storekriti.com`
- `mybrand.storekriti.com`

**Why This Works:**
- You control `storekriti.com` DNS
- No user DNS configuration needed
- SSL is automatic (wildcard certificate)
- Works immediately

**Implementation:**

1. **Configure wildcard DNS** for `storekriti.com`:
   ```
   *.storekriti.com → CNAME → your-app.lovable.app
   ```

2. **Update CustomDomainContext** to detect subdomains:
   ```typescript
   // Check if it's a storekriti subdomain
   const isStorekritiSubdomain = hostname.endsWith('.storekriti.com');
   if (isStorekritiSubdomain) {
     const subdomain = hostname.replace('.storekriti.com', '');
     // Look up tenant by subdomain/slug
   }
   ```

3. **Update database** - add `subdomain` column to tenants:
   ```sql
   ALTER TABLE tenants ADD COLUMN subdomain TEXT UNIQUE;
   ```

**User Experience:**
- User creates store → Gets `storename.storekriti.com` automatically
- No DNS knowledge required
- Works instantly

---

### 🌟 OPTION 2: Cloudflare for SaaS (BEST for Custom Domains)

**Complexity: ⭐⭐ Medium**  
**Cost: $20/month (Cloudflare for SaaS)**  
**Setup Time: 2-3 hours**

Cloudflare for SaaS allows your users to bring custom domains while you maintain one deployment.

**How It Works:**
```
User Domain → Cloudflare → Your Lovable App
             (SSL + Proxy)
```

**Implementation Steps:**

1. **Sign up for Cloudflare for SaaS** ($20/month)

2. **Create a fallback origin**:
   ```
   fallback.storekriti.com → CNAME → your-app.lovable.app
   ```

3. **Update DNS instructions for users**:
   ```
   Type: CNAME
   Name: @ or www
   Value: custom-ssl.storekriti.com (Cloudflare endpoint)
   ```

4. **Use Cloudflare API** to register custom domains:
   ```typescript
   // In verify-domain-dns function
   const response = await fetch(
     `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
     {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${apiToken}` },
       body: JSON.stringify({ hostname: domain })
     }
   );
   ```

**Benefits:**
- Automatic SSL for all custom domains
- DDoS protection
- Fast CDN
- Works with any domain

---

### 🌟 OPTION 3: Deploy to Vercel/Netlify

**Complexity: ⭐⭐ Medium**  
**Cost: FREE (with limits) or $20/month**  
**Setup Time: 1-2 hours**

Both Vercel and Netlify have built-in custom domain support.

**Vercel Approach:**

1. **Deploy app to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Use Vercel Domains API**:
   ```typescript
   // Add domain via API
   await fetch('https://api.vercel.com/v9/projects/{projectId}/domains', {
     method: 'POST',
     headers: { Authorization: `Bearer ${vercelToken}` },
     body: JSON.stringify({ name: domain })
   });
   ```

3. **Update DNS instructions**:
   ```
   Type: CNAME
   Name: @ or www
   Value: cname.vercel-dns.com
   ```

**Netlify Approach:**

Similar to Vercel, using Netlify's Sites API for domain management.

---

### 🌟 OPTION 4: Self-Hosted Reverse Proxy (Most Control)

**Complexity: ⭐⭐⭐⭐ Advanced**  
**Cost: $5-20/month (VPS)**  
**Setup Time: 4-8 hours**

Set up your own server with nginx + certbot.

**Architecture:**
```
User Domain → Your VPS (nginx) → Lovable App
              (Caddy/nginx + Let's Encrypt)
```

**Implementation:**

1. **Get a VPS** (DigitalOcean, AWS Lightsail, etc.)

2. **Install Caddy** (automatic SSL):
   ```bash
   apt install caddy
   ```

3. **Configure Caddy** for wildcard + custom domains:
   ```caddyfile
   {
     on_demand_tls {
       ask http://localhost:5555/check-domain
     }
   }
   
   :443 {
     tls {
       on_demand
     }
     reverse_proxy your-app.lovable.app
   }
   ```

4. **Create domain checker** endpoint to validate domains

5. **Update IP** in your code to the VPS IP

---

## 🎯 RECOMMENDED APPROACH: Hybrid Solution

**Phase 1 (Now - Quick Win):**
- Enable subdomain-only: `store.storekriti.com`
- Hide custom domain feature with "Coming Soon" badge
- This gives users a professional URL immediately

**Phase 2 (Later - Scale):**
- Implement Cloudflare for SaaS
- Enable custom domains for Pro users
- Charge premium for this feature

---

## 📝 Implementation Plan for Option 1 (Subdomain)

### Step 1: Update tenants table

```sql
-- Add subdomain column
ALTER TABLE tenants ADD COLUMN subdomain TEXT;
CREATE UNIQUE INDEX idx_tenant_subdomain ON tenants(subdomain) WHERE subdomain IS NOT NULL;

-- Auto-generate subdomain from store_slug
UPDATE tenants SET subdomain = store_slug WHERE subdomain IS NULL;
```

### Step 2: Update CustomDomainContext

```typescript
const STOREKRITI_DOMAIN = 'storekriti.com';

function resolveSubdomain(hostname: string): string | null {
  if (hostname.endsWith(`.${STOREKRITI_DOMAIN}`)) {
    return hostname.replace(`.${STOREKRITI_DOMAIN}`, '');
  }
  return null;
}

// In useEffect:
const subdomain = resolveSubdomain(hostname);
if (subdomain) {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .maybeSingle();
  // ...
}
```

### Step 3: Configure DNS (One-Time)

At your DNS provider for `storekriti.com`:
```
Type: CNAME
Name: *
Value: your-app.lovable.app
TTL: Auto
```

### Step 4: Update AdminDomains UI

Show subdomain prominently:
```tsx
<Alert>
  <CheckCircle2 className="h-4 w-4" />
  <AlertTitle>Your Store URL</AlertTitle>
  <AlertDescription>
    Your store is live at: 
    <strong>https://{tenant.subdomain}.storekriti.com</strong>
  </AlertDescription>
</Alert>
```

---

## ⚡ Quick Fix Options (Immediate Actions)

### Option A: Disable Custom Domain Feature Temporarily

```tsx
// In AdminDomains.tsx - Show "Coming Soon"
return (
  <div className="space-y-6">
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Custom Domains - Coming Soon</AlertTitle>
      <AlertDescription>
        Your store is currently available at:
        <br />
        <strong>https://storekriti.com/store/{storeSlug}</strong>
        <br /><br />
        Custom domain support is coming soon! In the meantime, share this URL with your customers.
      </AlertDescription>
    </Alert>
  </div>
);
```

### Option B: Update IP to Correct Server

If you have access to a server:

```typescript
// In verify-domain-dns/index.ts
const EXPECTED_IP = "YOUR_ACTUAL_SERVER_IP"; // Update this
```

---

## 📊 Comparison Table

| Feature | Subdomain | Cloudflare SaaS | Vercel/Netlify | Self-Hosted |
|---------|-----------|-----------------|----------------|-------------|
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐ Medium | ⭐⭐⭐⭐ Hard |
| **Monthly Cost** | FREE | $20 | $0-20 | $5-20 |
| **User DNS Setup** | None | CNAME | CNAME | A Record |
| **SSL** | Auto (wildcard) | Auto | Auto | Manual/Auto |
| **Custom Domains** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Control** | Low | Medium | Medium | Full |
| **Recommended For** | MVP/Start | Production | Production | Enterprise |

---

## 🚀 Next Steps

1. **Immediate**: Implement subdomain-only (Option 1)
2. **Week 2**: Test with beta users
3. **Month 2**: Evaluate if custom domains needed
4. **If needed**: Implement Cloudflare for SaaS (Option 2)

---

## 📞 Need Help?

The subdomain approach is the simplest and most reliable solution for now. Custom domains can be added later when you have:
- Dedicated hosting infrastructure
- Budget for Cloudflare/Vercel Pro
- Technical expertise for SSL management

**The key insight**: Custom domains require infrastructure that handles SSL termination. Without it, even perfect DNS configuration won't work.
