import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';

export function StoreAnalyticsTracker({ tenantId }: { tenantId: string }) {
  // Tracks sessions, page views, and performance metrics for all storefront routes.
  useStoreAnalytics({ tenantId, enabled: true });
  return null;
}
