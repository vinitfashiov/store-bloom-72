# Enterprise-Level Systems Guide
## Domain, Payment, and Shipping Systems

## 🎯 Overview

This guide covers the enterprise-level improvements made to the domain verification, payment processing, and shipping systems to handle lakhs of users and high transaction volumes.

---

## 🌐 Domain System

### Improvements Made

1. **Verification Tracking**
   - Tracks verification attempts
   - Stores verification errors
   - Auto-verification option
   - SSL status tracking

2. **Verification Logs**
   - Complete audit trail of all verification attempts
   - DNS records captured for debugging
   - Historical verification data

3. **Retry Mechanism**
   - Automatic retry for failed verifications
   - Exponential backoff
   - Configurable max attempts

### Usage

#### Enable Auto-Verification
```sql
UPDATE custom_domains 
SET auto_verify = true 
WHERE id = 'domain-id';
```

#### Manual Verification with Retry
The domain verification function now supports automatic retries. Failed verifications are automatically queued for retry.

#### View Verification History
```sql
SELECT * FROM domain_verification_logs 
WHERE domain_id = 'domain-id' 
ORDER BY verified_at DESC;
```

### Webhook Setup (Future)

For automatic domain verification, set up a webhook that calls:
```
POST /functions/v1/verify-domain-dns
{
  "domain": "example.com",
  "domain_id": "uuid"
}
```

---

## 💳 Payment System

### Improvements Made

1. **Webhook Handling**
   - Automatic payment status updates
   - Refund processing
   - Payment reconciliation
   - Failed payment handling

2. **Payment Reconciliation**
   - Automatic matching of expected vs received amounts
   - Discrepancy detection
   - Manual resolution workflow

3. **Refund Management**
   - Full refund tracking
   - Status updates via webhooks
   - Refund history

4. **Retry Queue**
   - Failed webhook processing retries
   - Exponential backoff
   - Max attempt limits

### Webhook Configuration

#### Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
   - `refund.processed`
4. Set webhook secret in Supabase environment variables:
   ```
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

#### Webhook Events Handled

- **payment.captured**: Updates order to paid, creates reconciliation record
- **payment.failed**: Marks payment as failed
- **refund.created**: Creates refund record, updates order refund amount
- **refund.processed**: Updates refund status

### Payment Reconciliation

#### Automatic Reconciliation
When a payment is captured, the system automatically:
1. Compares expected amount (from order) with received amount (from Razorpay)
2. Creates a reconciliation record
3. Marks as 'matched' or 'mismatch' based on comparison

#### Manual Reconciliation
```sql
-- View pending reconciliations
SELECT * FROM payment_reconciliation 
WHERE status IN ('pending', 'mismatch')
ORDER BY created_at DESC;

-- Resolve mismatch
UPDATE payment_reconciliation 
SET status = 'resolved',
    notes = 'Resolved manually',
    reconciled_at = NOW(),
    reconciled_by = 'user-uuid'
WHERE id = 'reconciliation-id';
```

### Refund Processing

#### Create Refund via API
```typescript
// In your admin panel
const { data, error } = await supabase.functions.invoke('create-refund', {
  body: {
    order_id: 'order-uuid',
    amount: 1000.00,
    reason: 'Customer requested'
  }
});
```

#### View Refunds
```sql
SELECT * FROM refunds 
WHERE order_id = 'order-uuid' 
ORDER BY created_at DESC;
```

---

## 📦 Shipping System

### Improvements Made

1. **Webhook Handling**
   - Automatic tracking updates
   - Order status synchronization
   - Delivery notifications

2. **Tracking Updates**
   - Complete tracking history
   - Location updates
   - Status timeline

3. **Automatic Order Status Updates**
   - Order status syncs with shipment status
   - Delivered → Order marked as delivered
   - RTO → Order marked as cancelled

4. **Retry Queue**
   - Failed webhook processing retries
   - Exponential backoff

### Webhook Configuration

#### Shiprocket Webhook Setup

1. Go to Shiprocket Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/shiprocket-webhook`
3. Select events:
   - Shipment status updates
   - Tracking updates
   - Delivery notifications

### Tracking Updates

#### View Tracking History
```sql
SELECT * FROM shipping_tracking_updates 
WHERE shipment_id = 'shipment-uuid' 
ORDER BY timestamp DESC;
```

#### Get Current Status
```sql
SELECT 
  s.*,
  st.status as current_tracking_status,
  st.location as current_location,
  st.timestamp as last_update
FROM shiprocket_shipments s
LEFT JOIN LATERAL (
  SELECT status, location, timestamp
  FROM shipping_tracking_updates
  WHERE shipment_id = s.id
  ORDER BY timestamp DESC
  LIMIT 1
) st ON true
WHERE s.order_id = 'order-uuid';
```

---

## 🔄 Retry Queue System

### How It Works

Failed operations are automatically queued for retry with exponential backoff:

1. **First retry**: 5 minutes
2. **Second retry**: 10 minutes
3. **Third retry**: 20 minutes
4. **Fourth retry**: 40 minutes
5. **Fifth retry**: 80 minutes

After 5 attempts, the operation is marked as 'failed'.

### Process Retries

Create a scheduled job (via pg_cron or external scheduler) to process retries:

```sql
-- Get pending retries
SELECT * FROM get_pending_retries(100);

-- Process retry (implement in your application)
-- This would call the appropriate function based on operation_type
```

### Manual Retry

```sql
-- Schedule a retry manually
SELECT schedule_operation_retry(
  'tenant-uuid',
  'payment_webhook',
  'webhook-uuid',
  '{"webhook_id": "uuid"}'::jsonb,
  'Error message'
);
```

---

## 📊 Monitoring & Health Checks

### System Health Monitoring

The system automatically tracks health of:
- Domain verification services
- Payment gateway connectivity
- Shipping API status

#### View Health Checks
```sql
SELECT * FROM system_health_checks 
WHERE check_type = 'payment_gateway'
ORDER BY checked_at DESC
LIMIT 10;
```

### Webhook Monitoring

#### View Unprocessed Webhooks
```sql
-- Payment webhooks
SELECT * FROM payment_webhooks 
WHERE processed = false 
ORDER BY created_at DESC;

-- Shipping webhooks
SELECT * FROM shipping_webhooks 
WHERE processed = false 
ORDER BY created_at DESC;
```

#### Webhook Statistics
```sql
-- Payment webhook stats
SELECT 
  webhook_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE processed = true) as processed,
  COUNT(*) FILTER (WHERE processed = false) as pending
FROM payment_webhooks
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY webhook_type;

-- Shipping webhook stats
SELECT 
  webhook_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE processed = true) as processed,
  COUNT(*) FILTER (WHERE processed = false) as pending
FROM shipping_webhooks
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY webhook_type;
```

---

## 🚀 Recommended Scheduled Jobs

### 1. Process Retry Queue (Every 5 minutes)
```sql
-- This should be implemented as a Supabase Edge Function
-- that processes pending retries
```

### 2. Health Checks (Every 15 minutes)
```sql
-- Check domain verification service
-- Check payment gateway
-- Check shipping API
```

### 3. Reconciliation Review (Daily)
```sql
-- Review pending reconciliations
SELECT * FROM payment_reconciliation 
WHERE status IN ('pending', 'mismatch')
AND created_at < NOW() - INTERVAL '1 day';
```

### 4. Cleanup Old Webhooks (Weekly)
```sql
-- Archive webhooks older than 90 days
DELETE FROM payment_webhooks 
WHERE created_at < NOW() - INTERVAL '90 days'
AND processed = true;

DELETE FROM shipping_webhooks 
WHERE created_at < NOW() - INTERVAL '90 days'
AND processed = true;
```

---

## 🔐 Security Best Practices

1. **Webhook Secrets**: Always use webhook secrets for verification
2. **Signature Verification**: All webhooks verify signatures before processing
3. **RLS Policies**: All tables have proper RLS policies
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Idempotency**: Webhooks are idempotent (can be safely retried)

---

## 📝 Environment Variables Required

Add these to your Supabase project:

```
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
SHIPROCKET_WEBHOOK_SECRET=your_shiprocket_webhook_secret (if applicable)
```

---

## 🆘 Troubleshooting

### Payment Webhooks Not Processing

1. Check webhook secret is configured
2. Verify webhook URL is correct in Razorpay dashboard
3. Check webhook logs: `SELECT * FROM payment_webhooks ORDER BY created_at DESC LIMIT 10;`
4. Check retry queue: `SELECT * FROM operation_retry_queue WHERE operation_type = 'payment_webhook';`

### Shipping Updates Not Syncing

1. Verify webhook URL in Shiprocket dashboard
2. Check webhook logs: `SELECT * FROM shipping_webhooks ORDER BY created_at DESC LIMIT 10;`
3. Check tracking updates: `SELECT * FROM shipping_tracking_updates ORDER BY timestamp DESC LIMIT 10;`

### Domain Verification Failing

1. Check verification logs: `SELECT * FROM domain_verification_logs WHERE domain_id = 'id' ORDER BY verified_at DESC;`
2. Verify DNS records are correct
3. Check if domain is in retry queue: `SELECT * FROM operation_retry_queue WHERE operation_type = 'domain_verify';`

---

## 📈 Performance Considerations

1. **Webhook Processing**: Webhooks are processed asynchronously to avoid blocking
2. **Indexes**: All tables have proper indexes for fast queries
3. **Retry Backoff**: Exponential backoff prevents overwhelming the system
4. **Batch Processing**: Retries are processed in batches

---

## ✅ Next Steps

1. **Set up webhooks** in Razorpay and Shiprocket dashboards
2. **Configure environment variables** in Supabase
3. **Set up scheduled jobs** for retry processing
4. **Monitor webhook logs** for first few days
5. **Set up alerts** for failed operations

---

## 📞 Support

For issues or questions:
1. Check webhook logs first
2. Review retry queue
3. Check system health checks
4. Review this documentation

