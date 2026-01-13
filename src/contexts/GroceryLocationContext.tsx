import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryArea {
  id: string;
  name: string;
  pincodes: string[];
  localities: string[] | null;
  is_active: boolean;
}

interface GroceryLocationContextType {
  pincode: string;
  locality: string | null;
  deliveryArea: DeliveryArea | null;
  isDeliverable: boolean;
  isLocationSet: boolean;
  isLoading: boolean;
  isInitialized: boolean; // NEW: tracks if initial check is done
  showLocationModal: boolean;
  setPincode: (pincode: string) => void;
  setLocality: (locality: string | null) => void;
  checkDeliverability: (tenantId: string) => Promise<boolean>;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  clearLocation: () => void;
}

const GroceryLocationContext = createContext<GroceryLocationContextType | undefined>(undefined);

const STORAGE_KEY_PINCODE = 'grocery_pincode';
const STORAGE_KEY_LOCALITY = 'grocery_locality';
const STORAGE_KEY_DELIVERABLE = 'grocery_deliverable';

export function GroceryLocationProvider({ children, tenantId }: { children: ReactNode; tenantId: string | null }) {
  const [pincode, setPincodeState] = useState<string>(() => {
    // Initialize from localStorage synchronously to prevent flash
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_PINCODE) || '';
    }
    return '';
  });
  const [locality, setLocalityState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_LOCALITY) || null;
    }
    return null;
  });
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea | null>(null);
  const [isDeliverable, setIsDeliverable] = useState(() => {
    // Initialize from cached value to prevent flash
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_DELIVERABLE) === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  const checkInProgressRef = useRef(false);

  // Check deliverability on mount if pincode exists
  useEffect(() => {
    const initializeLocation = async () => {
      if (tenantId && pincode && pincode.length === 6) {
        await checkDeliverability(tenantId);
      }
      setIsInitialized(true);
    };
    
    initializeLocation();
  }, [tenantId]);

  // Re-check when pincode changes (after initial load)
  useEffect(() => {
    if (isInitialized && tenantId && pincode && pincode.length === 6) {
      checkDeliverability(tenantId);
    } else if (!pincode && isInitialized) {
      setDeliveryArea(null);
      setIsDeliverable(false);
      localStorage.removeItem(STORAGE_KEY_DELIVERABLE);
    }
  }, [pincode, isInitialized]);

  const checkDeliverability = useCallback(async (tid: string): Promise<boolean> => {
    if (!pincode || pincode.length !== 6) {
      setIsDeliverable(false);
      setDeliveryArea(null);
      localStorage.removeItem(STORAGE_KEY_DELIVERABLE);
      return false;
    }

    // Prevent duplicate checks
    if (checkInProgressRef.current) return isDeliverable;
    checkInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      const { data: areas } = await supabase
        .from('delivery_areas')
        .select('id, name, pincodes, localities, is_active')
        .eq('tenant_id', tid)
        .eq('is_active', true);

      if (areas && areas.length > 0) {
        const matchedArea = areas.find(area => 
          area.pincodes && area.pincodes.includes(pincode)
        );

        if (matchedArea) {
          setDeliveryArea(matchedArea);
          setIsDeliverable(true);
          localStorage.setItem(STORAGE_KEY_DELIVERABLE, 'true');
          return true;
        }
      }

      setDeliveryArea(null);
      setIsDeliverable(false);
      localStorage.setItem(STORAGE_KEY_DELIVERABLE, 'false');
      return false;
    } catch (error) {
      console.error('Error checking deliverability:', error);
      setIsDeliverable(false);
      setDeliveryArea(null);
      return false;
    } finally {
      setIsLoading(false);
      checkInProgressRef.current = false;
    }
  }, [pincode, isDeliverable]);

  const setPincode = useCallback((newPincode: string) => {
    const sanitized = newPincode.replace(/\D/g, '').slice(0, 6);
    setPincodeState(sanitized);
    
    if (sanitized.length === 6) {
      localStorage.setItem(STORAGE_KEY_PINCODE, sanitized);
    } else if (sanitized.length === 0) {
      localStorage.removeItem(STORAGE_KEY_PINCODE);
      localStorage.removeItem(STORAGE_KEY_DELIVERABLE);
    }
  }, []);

  const setLocality = useCallback((newLocality: string | null) => {
    setLocalityState(newLocality);
    if (newLocality) {
      localStorage.setItem(STORAGE_KEY_LOCALITY, newLocality);
    } else {
      localStorage.removeItem(STORAGE_KEY_LOCALITY);
    }
  }, []);

  const openLocationModal = useCallback(() => {
    setShowLocationModal(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setShowLocationModal(false);
  }, []);

  const clearLocation = useCallback(() => {
    setPincodeState('');
    setLocalityState(null);
    setDeliveryArea(null);
    setIsDeliverable(false);
    localStorage.removeItem(STORAGE_KEY_PINCODE);
    localStorage.removeItem(STORAGE_KEY_LOCALITY);
    localStorage.removeItem(STORAGE_KEY_DELIVERABLE);
  }, []);

  const isLocationSet = pincode.length === 6;

  return (
    <GroceryLocationContext.Provider
      value={{
        pincode,
        locality,
        deliveryArea,
        isDeliverable,
        isLocationSet,
        isLoading,
        isInitialized,
        showLocationModal,
        setPincode,
        setLocality,
        checkDeliverability,
        openLocationModal,
        closeLocationModal,
        clearLocation
      }}
    >
      {children}
    </GroceryLocationContext.Provider>
  );
}

export function useGroceryLocation() {
  const context = useContext(GroceryLocationContext);
  if (!context) {
    throw new Error('useGroceryLocation must be used within a GroceryLocationProvider');
  }
  return context;
}
