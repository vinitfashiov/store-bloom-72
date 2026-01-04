import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: 'owner';
  tenant_id: string | null;
  onboarding_completed: boolean;
}

interface Tenant {
  id: string;
  store_name: string;
  store_slug: string;
  business_type: 'ecommerce' | 'grocery';
  plan: 'trial' | 'pro';
  trial_ends_at: string;
  is_active: boolean;
  address: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  tenant: Tenant | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data as Profile);
      return data;
    }
    return null;
  };

  const fetchTenant = async (tenantId: string) => {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .is('deleted_at', null) // Exclude deleted tenants
      .maybeSingle();
    
    if (!error && data) {
      setTenant(data as Tenant);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      
      // Get primary tenant from user_tenants
      const { data: primaryTenant } = await supabase
        .rpc('get_user_primary_tenant_id');
      
      if (primaryTenant) {
        await fetchTenant(primaryTenant);
      } else if (profileData?.tenant_id) {
        // Fallback to profile.tenant_id for backward compatibility
        await fetchTenant(profileData.tenant_id);
      }
    }
  };

  const refreshTenant = async () => {
    if (profile?.tenant_id) {
      await fetchTenant(profile.tenant_id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            
            // Get primary tenant from user_tenants
            const { data: primaryTenant } = await supabase
              .rpc('get_user_primary_tenant_id');
            
            if (primaryTenant) {
              await fetchTenant(primaryTenant);
            } else if (profileData?.tenant_id) {
              // Fallback to profile.tenant_id for backward compatibility
              await fetchTenant(profileData.tenant_id);
            }
          }, 0);
        } else {
          setProfile(null);
          setTenant(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(async (profileData) => {
          // Get primary tenant from user_tenants
          const { data: primaryTenant } = await supabase
            .rpc('get_user_primary_tenant_id');
          
          if (primaryTenant) {
            await fetchTenant(primaryTenant);
          } else if (profileData?.tenant_id) {
            // Fallback to profile.tenant_id for backward compatibility
            await fetchTenant(profileData.tenant_id);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      tenant,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      refreshTenant
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
