import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompleteSignupFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

export const CompleteSignupForm = ({ isLoading, setIsLoading, onSuccess }: CompleteSignupFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCompleteSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const accessCode = formData.get('accessCode') as string;
    const password = formData.get('password') as string;

    try {
      // Check if access code is valid and get registration data
      const { data: registration, error: registrationError } = await supabase
        .from('client_registrations')
        .select('*')
        .eq('access_code', accessCode)
        .eq('status', 'approved')
        .maybeSingle();

      if (registrationError) {
        console.error('Registration query error:', registrationError);
        throw new Error(`Database error: ${registrationError.message}`);
      }

      if (!registration) {
        throw new Error('Invalid access code or registration not approved');
      }

      // Check if user already exists in auth
      let authUserId = null;
      
      // First try to sign in to see if user already exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: registration.email,
        password
      });

      if (signInData.user) {
        // User exists and password is correct
        authUserId = signInData.user.id;
        console.log('User already exists, signed in successfully');
      } else if (signInError?.message?.includes('Invalid login credentials')) {
        // User exists but wrong password OR user doesn't exist
        // Try to create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: registration.email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/client-dashboard`,
            data: {
              full_name: registration.full_name,
              access_code: accessCode
            }
          }
        });

        if (authError) {
          if (authError.message.includes('User already registered')) {
            throw new Error('Account already exists. Please use the correct password or reset your password.');
          }
          console.error('Auth signup error:', authError);
          throw new Error(`Authentication failed: ${authError.message}`);
        }

        if (authData.user) {
          authUserId = authData.user.id;
          console.log('New user created successfully');
          
          // For new signups, we need to sign in the user manually since email confirmation might be disabled
          const { data: signInAfterSignup, error: signInAfterSignupError } = await supabase.auth.signInWithPassword({
            email: registration.email,
            password
          });
          
          if (signInAfterSignupError) {
            console.warn('Sign in after signup failed:', signInAfterSignupError);
            // Continue anyway, user might already be signed in
          }
        }
      } else {
        // Other sign in error
        throw new Error(`Sign in failed: ${signInError?.message || 'Unknown error'}`);
      }

      if (!authUserId) {
        throw new Error('Failed to authenticate user');
      }

      // Check if client profile already exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', authUserId)
        .maybeSingle();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Profile check error:', profileCheckError);
        throw new Error(`Profile check failed: ${profileCheckError.message}`);
      }

      // Create client profile if it doesn't exist
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: authUserId,
            full_name: registration.full_name,
            phone_number: registration.mobile_number,
            company_name: registration.company_name,
            job_title: registration.job_title,
            avatar_url: registration.avatar_url,
            client_status: 'active'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }
        console.log('Client profile created successfully');
      } else {
        console.log('Client profile already exists');
      }

      // Mark registration as completed
      const { error: updateError } = await supabase
        .from('client_registrations')
        .update({ status: 'completed' })
        .eq('access_code', accessCode);

      if (updateError) {
        console.warn('Failed to update registration status:', updateError);
      }

      toast({
        title: 'Success',
        description: 'Account setup completed successfully! You can now access your dashboard.'
      });
      
      (e.target as HTMLFormElement).reset();
      
      // Callback to parent component
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect to dashboard using React Router
      setTimeout(() => {
        navigate('/client-dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Complete signup error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete signup',
        variant: 'destructive'
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleCompleteSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="access-code">Access Code</Label>
        <Input 
          id="access-code" 
          name="accessCode" 
          type="text" 
          placeholder="Enter your access code" 
          required 
          className="uppercase"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="complete-password">Password</Label>
        <PasswordInput 
          id="complete-password" 
          name="password" 
          placeholder="Create a password" 
          required 
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        <UserPlus className="w-4 h-4 mr-2" />
        {isLoading ? 'Completing signup...' : 'Complete Signup'}
      </Button>
    </form>
  );
};