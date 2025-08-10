
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { performRobustSignOut, cleanupAuthState } from '@/lib/authUtils';

interface ClientUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  company_name?: string;
  job_title?: string;
  avatar_url?: string;
  client_status?: string;
  created_at?: string;
  updated_at?: string;
}

interface ClientAuthContextType {
  user: ClientUser | null;
  loading: boolean;
  signUp: (userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    company_name?: string;
    job_title?: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ClientUser>) => Promise<{ error: any }>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Session check result:', { hasSession: !!session, userId: session?.user?.id, email: session?.user?.email });
      
      if (session?.user) {
        console.log('✅ Valid session found, setting up user...');
        
        // Always set a basic user first to prevent logout, then enhance with profile data
        const basicUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'User',
        };
        
        setUser(basicUser);
        
        // Try to enhance with client profile data, but don't fail if not found
        try {
          const { data: clientData, error: clientError } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          console.log('📋 Client profile query result:', { clientData, clientError });

          if (!clientError && clientData) {
            console.log('✅ Found client profile data, updating user...');
            setUser({
              id: session.user.id, // Use auth user ID, not profile ID
              email: session.user.email || '',
              full_name: clientData.full_name || basicUser.full_name,
              phone_number: clientData.phone_number,
              company_name: clientData.company_name,
              job_title: clientData.job_title,
              avatar_url: clientData.avatar_url,
              client_status: clientData.client_status,
              created_at: clientData.created_at,
              updated_at: clientData.updated_at
            });
          } else {
            // Try to get name from registration as fallback
            console.log('📝 No client profile, checking registrations...');
            
            try {
              const { data: registrationData, error: regError } = await supabase
                .from('client_registrations')
                .select('full_name, email, status')
                .eq('email', session.user.email)
                .maybeSingle();

              console.log('📋 Registration data:', { registrationData, regError });

              if (!regError && registrationData && registrationData.full_name) {
                console.log('✅ Found registration data, updating user name...');
                setUser({
                  ...basicUser,
                  full_name: registrationData.full_name,
                });
              }
            } catch (regError) {
              console.log('⚠️ Registration check failed, keeping basic user:', regError);
              // Keep the basic user, don't fail
            }
          }
        } catch (profileError) {
          console.log('⚠️ Profile enhancement failed, keeping basic user:', profileError);
          // Keep the basic user, don't fail
        }
      } else {
        console.log('❌ No session found');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Session check error:', error);
      // Only set user to null if there's really no session, not on DB errors
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      if (!session?.user) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change event:', event, 'Session exists:', !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Sign in detected, will check session...');
          // Use setTimeout to defer the async operations to prevent deadlock
          setTimeout(() => {
            checkSession();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Sign out detected');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, maintaining session...');
          // Don't trigger a full re-check on token refresh, just ensure user state is maintained
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          console.log('🔄 Initial session detected on page load, checking session...');
          setTimeout(() => {
            checkSession();
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    company_name?: string;
    job_title?: string;
  }) => {
    try {
      // Check if registration request already exists
      const { data: existingRegistration } = await supabase
        .from('client_registrations')
        .select('id, status')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingRegistration) {
        if (existingRegistration.status === 'pending') {
          return { error: new Error('Registration request already submitted and pending approval.') };
        } else if (existingRegistration.status === 'approved') {
          return { error: new Error('Registration approved. Please sign in instead.') };
        }
      }

      // Create registration request for admin approval
      console.log('Creating registration request for:', userData.email);
      const { error: registrationError } = await supabase
        .from('client_registrations')
        .insert({
          email: userData.email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          company_name: userData.company_name,
          job_title: userData.job_title,
          status: 'pending'
        });

      if (registrationError) {
        console.error('Registration request failed:', registrationError);
        return { error: new Error(`Registration failed: ${registrationError.message}`) };
      }

      console.log('Registration request created successfully');
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any existing auth state before signing in
      cleanupAuthState();
      
      // Try to sign out any existing session globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      console.log('🔍 Attempting direct sign in for email:', email);

      // Try to sign in directly first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth sign in error:', authError);
        
        // If sign in fails, check registration status to provide helpful error message
        if (authError.message?.includes('Invalid login credentials')) {
          console.log('🔍 Invalid credentials, checking registration status for helpful error...');
          
          try {
            const { data: registration, error: regError } = await supabase
              .from('client_registrations')
              .select('status, access_code, full_name')
              .eq('email', email)
              .maybeSingle();

            if (!regError && registration) {
              if (registration.status === 'pending') {
                return { error: new Error('Account not approved yet. Please wait for admin approval or contact support.') };
              }
              if (registration.status === 'rejected') {
                return { error: new Error('Registration was rejected. Please contact support.') };
              }
              if (registration.status === 'approved') {
                return { error: new Error('Please complete your signup using the "Complete" tab with your access code: ' + registration.access_code) };
              }
            } else if (!registration) {
              return { error: new Error('No registration found. Please register first or contact support.') };
            }
          } catch (regCheckError) {
            console.error('Error checking registration:', regCheckError);
            // Fall through to return original auth error
          }
        }
        
        return { error: authError };
      }

      if (authData.user) {
        console.log('🎉 Sign in successful for client:', email);
        return { error: null };
      }

      return { error: new Error('Sign in failed - no user data returned') };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    await performRobustSignOut(supabase, '/client-auth');
  };

  const updateProfile = async (data: Partial<ClientUser>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Get current session to get the user_id
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { error: new Error('No active session') };
      }

      const { error } = await supabase
        .from('client_profiles')
        .update(data)
        .eq('user_id', session.user.id);

      if (!error) {
        setUser({ ...user, ...data });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <ClientAuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};
