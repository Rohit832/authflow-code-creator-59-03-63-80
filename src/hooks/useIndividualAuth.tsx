import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { performRobustSignOut, cleanupAuthState } from '@/lib/authUtils';

interface IndividualUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface IndividualAuthContextType {
  user: IndividualUser | null;
  loading: boolean;
  signUp: (userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<IndividualUser>) => Promise<{ error: any }>;
}

const IndividualAuthContext = createContext<IndividualAuthContextType | undefined>(undefined);

export const IndividualAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IndividualUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 Individual session check:', { hasSession: !!session, userId: session?.user?.id });
      
      if (session?.user) {
        // Set basic user first
        const basicUser = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || 'User',
        };
        
        setUser(basicUser);
        
        // Try to enhance with individual profile data
        try {
          const { data: profileData, error } = await supabase
            .from('individual_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!error && profileData) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: profileData.full_name || basicUser.full_name,
              phone_number: profileData.phone_number,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at
            });
          }
        } catch (profileError) {
          console.log('⚠️ Profile enhancement failed, keeping basic user:', profileError);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Individual session check error:', error);
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
        console.log('🔄 Individual auth state change:', event, 'Session exists:', !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            checkSession();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Don't trigger full re-check on token refresh
        } else if (event === 'INITIAL_SESSION' && session?.user) {
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
  }) => {
    try {
      console.log('🚀 Starting individual signup for:', userData.email);

      // First, ensure we're signed out
      await supabase.auth.signOut();

      // Check if individual profile already exists
      const { data: existingProfile } = await supabase
        .from('individual_profiles')
        .select('user_id, email')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingProfile) {
        return { error: new Error('An individual account with this email already exists. Please sign in instead.') };
      }

      // Try to create new auth user directly
      console.log('📧 Creating new auth user...');
      
      const redirectUrl = `${window.location.origin}/individual-dashboard`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            user_type: 'individual'
          }
        }
      });

      // Handle "User already registered" error
      if (authError?.message?.includes('User already registered')) {
        console.log('🔍 User exists in auth, checking profile status...');
        
        // Try to sign in to get user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password
        });

        if (signInError) {
          return { error: new Error('Email already exists but password is incorrect.') };
        }

        if (signInData.user) {
          // Check if individual profile exists
          const { data: individualProfile } = await supabase
            .from('individual_profiles')
            .select('user_id')
            .eq('user_id', signInData.user.id)
            .maybeSingle();

          if (individualProfile) {
            await supabase.auth.signOut();
            return { error: new Error('Individual account already exists. Please sign in instead.') };
          }

          // Create individual profile for existing auth user
          console.log('✅ Creating individual profile for existing auth user...');
          const { data: profileData, error: profileError } = await supabase
            .from('individual_profiles')
            .insert({
              user_id: signInData.user.id,
              email: userData.email,
              full_name: userData.full_name,
              phone_number: userData.phone_number,
            })
            .select()
            .single();

          if (profileError) {
            console.error('❌ Profile creation error:', profileError);
            await supabase.auth.signOut();
            return { error: new Error('Failed to create individual profile. Please contact support.') };
          }

          console.log('✅ Individual profile created for existing user:', profileData);
          return { error: null };
        }
      }

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        return { error: authError };
      }

      if (authData.user) {
        console.log('✅ New auth user created, creating profile...');
        
        // Create individual profile for new user
        const { data: profileData, error: profileError } = await supabase
          .from('individual_profiles')
          .insert({
            user_id: authData.user.id,
            email: userData.email,
            full_name: userData.full_name,
            phone_number: userData.phone_number,
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ Individual profile creation error:', profileError);
          // Try to clean up the auth user if profile creation fails
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError);
          }
          return { error: new Error('Failed to create user profile. Please try again.') };
        }

        console.log('✅ Individual profile created successfully:', profileData);
      }

      return { error: null };
    } catch (error) {
      console.error('💥 Individual signup error:', error);
      return { error: new Error('Account creation failed. Please try again.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { error: authError };
      }

      if (authData.user) {
        // Verify this user has an individual profile
        const { data: individualProfile, error: profileError } = await supabase
          .from('individual_profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile verification error:', profileError);
          await supabase.auth.signOut();
          return { error: new Error('Account verification failed. Please try again.') };
        }

        if (!individualProfile) {
          // User exists but doesn't have individual profile
          await supabase.auth.signOut();
          return { error: new Error('This account is not set up for individual access. Please check your email or create a new individual account.') };
        }

        console.log('🎉 Individual sign in successful:', email);
        return { error: null };
      }

      return { error: new Error('Sign in failed - no user data returned') };
    } catch (error) {
      console.error('Individual sign in error:', error);
      return { error: new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    await performRobustSignOut(supabase, '/individual-auth');
  };

  const updateProfile = async (data: Partial<IndividualUser>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { error: new Error('No active session') };
      }

      const { error } = await supabase
        .from('individual_profiles')
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
    <IndividualAuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </IndividualAuthContext.Provider>
  );
};

export const useIndividualAuth = () => {
  const context = useContext(IndividualAuthContext);
  if (context === undefined) {
    throw new Error('useIndividualAuth must be used within an IndividualAuthProvider');
  }
  return context;
};