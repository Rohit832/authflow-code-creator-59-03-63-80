import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Key, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IndividualForgotPasswordFormProps {
  onBack: () => void;
}

type Step = 'email' | 'otp' | 'password' | 'success';

export const IndividualForgotPasswordForm = ({ onBack }: IndividualForgotPasswordFormProps) => {
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const { toast } = useToast();

  // Verify OTP when complete
  useEffect(() => {
    if (otpValue.length === 6 && step === 'otp') {
      verifyOtp();
    }
  }, [otpValue, step]);

  const verifyOtp = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('verify-otp-reset', {
        body: {
          email,
          otpCode: otpValue,
          newPassword: '', // We'll set the password in the next step
          userType: 'individual',
          verifyOnly: true // Flag to only verify OTP without resetting password
        }
      });

      if (error) {
        throw error;
      }

      // OTP is valid, proceed to password step
      setTimeout(() => {
        setStep('password');
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Invalid OTP',
        description: 'The OTP code you entered is invalid or expired. Please try again.',
        variant: 'destructive'
      });
      setOtpValue(''); // Clear the OTP input
    }
    
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);

    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: emailValue,
          userType: 'individual'
        }
      });

      if (error) {
        throw error;
      }

      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'If an individual account with that email exists, a 6-digit OTP has been sent.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          userType: 'individual'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'OTP Resent',
        description: 'A new 6-digit OTP has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend OTP. Please try again.',
        variant: 'destructive'
      });
    }

    setIsResending(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('verify-otp-reset', {
        body: {
          email,
          otpCode: otpValue,
          newPassword,
          userType: 'individual',
          verifyOnly: false // Actually reset the password this time
        }
      });

      if (error) {
        throw error;
      }

      setStep('success');
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now sign in with your new password.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid or expired OTP. Please try again.',
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  if (step === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <Lock className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <h3 className="font-semibold text-green-800 mb-1">Password Reset Complete</h3>
          <p className="text-sm text-green-700">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </div>
        <Button
          type="button"
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-foreground mb-1">Enter OTP Code</h3>
          <p className="text-sm text-muted-foreground">
            Check your email for a 6-digit OTP code. It will automatically proceed to the next step.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>6-Digit OTP Code</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} disabled={isLoading}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {isLoading && (
              <p className="text-sm text-muted-foreground text-center">
                Verifying OTP...
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendOtp}
              disabled={isResending}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isResending ? 'Resending OTP...' : 'Resend OTP'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('email')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-foreground mb-1">Set New Password</h3>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Key className="w-4 h-4 mr-2" />
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('otp')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to OTP
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-foreground mb-1">Reset Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a 6-digit OTP code.
        </p>
      </div>
      
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending OTP...' : 'Send OTP Code'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </form>
    </div>
  );
};