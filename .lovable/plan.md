

# External Razorpay Payment Flow with Deep Link Return

## Problem Statement

Your WebView-based APK apps (both admin subscription and storefront checkout) currently open Razorpay's checkout.js popup **inside the WebView**. This creates issues:
- WebView popup handling can be unreliable
- Some UPI apps don't launch properly from WebView
- Payment experience feels constrained

## Solution Architecture

Instead of the SDK popup, we'll use **Razorpay Standard Checkout URL** that:
1. Opens in the **external browser/Razorpay app**
2. User completes payment natively
3. Razorpay redirects to a **callback URL** with payment status
4. Your app catches the deep link and processes the result

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL PAYMENT FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────────────────┐ │
│  │  Your App   │───▶│ External Browser │───▶│  Razorpay Payment Page          │ │
│  │  (WebView)  │    │  or Razorpay App │    │  - UPI, Cards, Netbanking       │ │
│  └─────────────┘    └──────────────────┘    └─────────────────────────────────┘ │
│        ▲                                              │                         │
│        │                                              │                         │
│        │     Deep Link: storekriti://payment/success  │                         │
│        │     or storekriti://payment/failure          │                         │
│        │                                              ▼                         │
│        └──────────────────────────────────────────────┘                         │
│                                                                                 │
│  App receives deep link → Verifies payment → Shows success/failure              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Define Deep Link URL Scheme

**Android Deep Links (AndroidManifest.xml)**
Add intent filters to handle payment return URLs:
- `storekriti://payment/success`
- `storekriti://payment/failure`
- `storekriti://payment/cancelled`

Also support HTTPS universal links for web fallback:
- `https://storekriti.lovable.app/payment-callback`

### Phase 2: Create Payment Callback Edge Function

**New Function: `payment-redirect-callback`**

This function serves as the redirect target that Razorpay will call after payment. It:
1. Receives payment details from Razorpay
2. Verifies the payment signature
3. Redirects to deep link URL with status

### Phase 3: Modify Payment Initiation Flow

**Admin Upgrade (`AdminUpgrade.tsx`)**
- Detect if running in WebView/native app
- If native: Open Razorpay Standard Checkout URL in external browser instead of SDK popup
- Pass callback URL pointing to our edge function

**Storefront Checkout (`CheckoutPage.tsx`)**
- Same pattern: detect native app context
- Open external browser for payment
- Handle deep link return

### Phase 4: Create Payment Callback Handler Page

**New Page: `PaymentCallback.tsx`**

This page handles both:
1. Web browser returns (via URL query params)
2. Deep link returns (via App Links)

It shows loading state, verifies payment, and redirects to success/failure page.

### Phase 5: Native App Configuration

**Update `capacitor.config.ts`**
- Configure App Links for Android
- Set up deep link handling

**Update Build Script**
- Include deep link scheme in white-label builds

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/payment-redirect-callback/index.ts` | Handles Razorpay redirect, verifies payment, redirects to app |
| `src/pages/PaymentCallback.tsx` | Receives deep link, shows status, redirects |
| `src/hooks/useNativePayment.ts` | Detects native app, handles external payment flow |

## Files to Modify

| File | Changes |
|------|---------|
| `android/app/src/main/AndroidManifest.xml` | Add intent filters for deep links |
| `capacitor.config.ts` | Configure server settings and plugins |
| `src/pages/admin/AdminUpgrade.tsx` | Add native payment detection, use external flow |
| `src/pages/store/CheckoutPage.tsx` | Same - use external flow when in native app |
| `src/App.tsx` | Add route for `/payment-callback` |
| `supabase/functions/create-razorpay-order/index.ts` | Return redirect URL for external flow |
| `supabase/functions/create-upgrade-order/index.ts` | Add redirect URL support |

---

## Technical Details

### Deep Link URL Format

```text
Admin Upgrade Success:
storekriti://payment/upgrade-success?tenant_id={id}&payment_id={razorpay_payment_id}

Admin Upgrade Failure:
storekriti://payment/upgrade-failure?error={reason}

Storefront Order Success:
storekriti://payment/order-success?store_slug={slug}&order_number={order_number}

Storefront Order Failure:
storekriti://payment/order-failure?store_slug={slug}&intent_id={payment_intent_id}&error={reason}
```

### Native Detection Logic

```typescript
const isNativeApp = () => {
  // Check if running inside Capacitor WebView
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

const isWebView = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('wv') || 
         ua.includes('webview') || 
         (ua.includes('android') && ua.includes('version/'));
};
```

### External Payment URL Flow

Instead of SDK popup, we construct and open:
```text
https://api.razorpay.com/v1/checkout/embedded?
  key_id={razorpay_key}&
  order_id={order_id}&
  name={store_name}&
  description={order_description}&
  callback_url={our_edge_function_url}&
  cancel_url={our_cancel_url}
```

### Callback Edge Function Flow

```text
1. Razorpay POST/GET to /functions/v1/payment-redirect-callback
2. Extract: razorpay_payment_id, razorpay_order_id, razorpay_signature
3. Verify signature using HMAC
4. If valid: Update order/subscription, redirect to success deep link
5. If invalid: Redirect to failure deep link
```

---

## Database Changes

**Add column to track callback status:**
```sql
ALTER TABLE payment_intents 
ADD COLUMN IF NOT EXISTS callback_handled BOOLEAN DEFAULT FALSE;
```

This prevents duplicate processing if user manually returns to app.

---

## Security Considerations

1. **Signature Verification**: All payments verified server-side before activation
2. **One-Time Processing**: `callback_handled` flag prevents replay attacks
3. **Timeout Handling**: Payment intents expire after 30 minutes
4. **State Parameter**: Include encrypted state to prevent CSRF

---

## User Experience Flow

### Storefront Customer (Order Payment)

1. Customer fills checkout form, selects Razorpay
2. Taps "Place Order" → App opens external browser/Razorpay
3. Customer completes payment (UPI/Card/etc.)
4. Razorpay redirects to callback URL
5. Callback verifies payment, creates order
6. Redirects to deep link → App opens
7. App shows Order Confirmation page

### Admin (Subscription Upgrade)

1. Admin on Upgrade page, taps "Upgrade to Pro"
2. App opens external browser with Razorpay
3. Admin completes payment
4. Callback verifies, upgrades plan
5. Redirects to deep link → App opens
6. App shows Dashboard with Pro badge

---

## Fallback for Web Users

The same flow works for regular web users:
- Instead of deep link, redirect to HTTPS callback URL
- Page processes query params and shows result
- No special handling needed - same code path

---

## Summary

This implementation provides:
- Native payment experience (external browser/UPI apps)
- Reliable deep link returns to your app
- Works for both admin subscriptions and storefront orders
- Backward compatible with web users
- Secure server-side payment verification

