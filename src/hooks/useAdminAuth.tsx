import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { performRobustSignOut } from '@/lib/authUtils';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  role_title?: string;
  department?: string;
  permissions?: any;
  is_super_admin?: boolean;
  is_approved?: boolean;
  password_hash?: string;
  role?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signUp: (userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    role_title?: string;
    department?: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AdminUser>) => Promise<{ error: any }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Verify this is an admin user by checking admin_profiles
        const { data: adminData, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!error && adminData) {
          setUser(adminData);
        } else {
          // If user exists in auth but not in admin_profiles table, sign them out
          console.log('User exists in auth but not in admin_profiles table');
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to defer async operations and avoid hooks ordering issues
          setTimeout(async () => {
            const { data: adminData } = await supabase
              .from('admin_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (adminData) {
              setUser(adminData);
            }
            setLoading(false);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
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
    role_title?: string;
    department?: string;
  }) => {
    try {
      // Check if admin already exists in our admin_profiles table
      const { data: existingAdmin } = await supabase
        .from('admin_profiles')
        .select('id, email')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingAdmin) {
        return { error: new Error('Admin with this email already exists. Please sign in instead.') };
      }

      // Create auth user first
      let authData: any = null;
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-dashboard`
        }
      });

      // Handle user already exists in auth but not in admin table
      if (authError && authError.message === 'User already registered') {
        // Check if admin profile already exists for this email
        const { data: existingProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .ilike('email', userData.email)
          .maybeSingle();

        if (existingProfile) {
          return { error: new Error('Admin with this email already exists. Please sign in instead.') };
        }

        // If user exists in auth but not in our admin table, this is an orphaned user
        // Try to clean it up first
        try {
          const { data, error } = await supabase.functions.invoke('cleanup-orphaned-users', {
            body: { email: userData.email }
          });
          
          if (error) {
            return { error: new Error('This email is already registered but has orphaned data. Please contact support.') };
          }
          
          // After cleanup, try creating the user again
          const { data: retryData, error: retryError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              emailRedirectTo: `${window.location.origin}/admin-dashboard`
            }
          });
          
          if (retryError) {
            return { error: new Error('Failed to create account after cleanup. Please try again.') };
          }
          
          authData = retryData;
        } catch (cleanupError) {
          return { error: new Error('This email is already registered. If you believe this is an error, please contact support.') };
        }
      } else if (authError) {
        return { error: authError };
      } else {
        authData = signUpData;
      }

      if (authData.user) {
        // Hash password for admin table
        const { data: hashedPassword, error: hashError } = await supabase.rpc('simple_hash_password', {
          password: userData.password
        });

        if (hashError) {
          console.error('Password hashing failed:', hashError);
          // Sign out the user if password hashing fails
          await supabase.auth.signOut();
          return { error: new Error('Failed to secure password. Please try again.') };
        }

        // Create admin profile record
        const { error: profileError } = await supabase
          .from('admin_profiles')
          .insert({
            user_id: authData.user.id,
            email: userData.email,
            password_hash: hashedPassword,
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            role_title: userData.role_title,
            department: userData.department,
            role: 'admin',
            is_approved: false // Default to false for approval system
          });

        if (profileError) {
          console.error('Admin profile creation failed:', profileError);
          // Sign out the user since profile creation failed
          await supabase.auth.signOut();
          return { error: new Error(`Database error: ${profileError.message}`) };
        }

        // Sign out the user after successful signup to prevent auto-login
        await supabase.auth.signOut();
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process for:', email);
      console.log('Email being searched (lowercase):', email.toLowerCase());
      
      // First check if user already exists in admin_profiles table
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin_profiles')
        .select('is_super_admin, email, user_id, full_name, is_approved')
        .ilike('email', email)
        .maybeSingle();

      console.log('Admin check result:', { existingAdmin, adminCheckError });

      if (adminCheckError && adminCheckError.code !== 'PGRST116') {
        console.error('Admin check error:', adminCheckError);
        return { error: new Error('Failed to verify admin status') };
      }

      // If user exists in admin_profiles table, check approval
      if (existingAdmin) {
        console.log('Found existing admin:', existingAdmin);
        if (existingAdmin.is_super_admin) {
          console.log('User is super admin, proceeding with login');
        } else {
          console.log('User exists in admin_profiles, checking approval status');

          if (!existingAdmin.is_approved) {
            return { error: new Error('Your admin account is pending approval. Please wait for access.') };
          }
        }
      } else {
        return { error: new Error('You do not have admin access. Please contact an administrator.') };
      }
      
      // Try to sign in with Supabase Auth first
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth sign in error:', authError);
        return { error: authError };
      }

      console.log('Supabase auth successful');
      
      // Update last login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('admin_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', user.id);
      }

      console.log('Sign in completed successfully');
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new Error('Sign in failed') };
    }
  };

  const signOut = async () => {
    await performRobustSignOut(supabase, '/admin-auth');
  };

  const updateProfile = async (data: Partial<AdminUser>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update(data)
        .eq('user_id', user.user_id);

      if (!error) {
        setUser({ ...user, ...data });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};