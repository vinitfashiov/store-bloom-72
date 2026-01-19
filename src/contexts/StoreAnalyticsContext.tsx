import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface StoreAnalyticsContextType {
  trackEvent: (eventType: string, eventData?: Record<string, unknown>) => void;
}

const StoreAnalyticsContext = createContext<StoreAnalyticsContextType | null>(null);

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem('analytics_visitor_id');
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem('analytics_visitor_id', visitorId);
  }
  return visitorId;
}

export function StoreAnalyticsProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const trackEvent = useCallback(
    (eventType: string, eventData: Record<string, unknown> = {}) => {
      if (!tenantId) return;

      void supabase.functions.invoke('track-analytics', {
        headers: { 'x-tenant-id': tenantId },
        body: {
          type: 'event',
          session_id: getSessionId(),
          visitor_id: getVisitorId(),
          data: {
            event_type: eventType,
            event_data: eventData,
            page_url: window.location.pathname,
          },
        },
      });
    },
    [tenantId]
  );

  const value = useMemo(() => ({ trackEvent }), [trackEvent]);

  return <StoreAnalyticsContext.Provider value={value}>{children}</StoreAnalyticsContext.Provider>;
}

export function useStoreAnalyticsEvent() {
  const ctx = useContext(StoreAnalyticsContext);
  if (!ctx) {
    // Return no-op if not within provider (for safety)
    return { trackEvent: () => {} };
  }
  return ctx;
}
