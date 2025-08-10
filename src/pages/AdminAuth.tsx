import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Shield, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';

const AdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signUp, signIn, user, loading } = useAdminAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated admin users to admin dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('Admin user already authenticated, redirecting to admin dashboard');
      navigate('/admin-dashboard');
    }
  }, [user, loading, navigate]);
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const { error } = await signUp({
      email,
      password,
      full_name: fullName
    });
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Admin account created successfully!'
      });
      (e.target as HTMLFormElement).reset();
    }
    setIsLoading(false);
  };
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSignInError(null); // Clear previous errors

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    console.log('Attempting sign in for:', email);
    
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Sign in failed:', error);
      setSignInError(error.message);
      toast({
        title: 'Sign In Failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      // Success - user will be redirected by useEffect when profile loads
      console.log('Admin sign-in successful, waiting for redirect...');
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 left-4 flex items-center gap-2 text-sm">
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </Button>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-600">Finsage Consult</h2>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">Admin </CardTitle>
          
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              {showForgotPassword ? <ForgotPasswordForm userType="admin" onBack={() => setShowForgotPassword(false)} /> : <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" name="email" type="email" placeholder="Enter your email" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Password</Label>
                      <Button type="button" variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setShowForgotPassword(true)}>
                        Forgot password?
                      </Button>
                    </div>
                    <PasswordInput id="signin-password" name="password" placeholder="Enter your password" required />
                  </div>
                  {signInError && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
                      {signInError}
                    </div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>}
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" name="fullName" type="text" placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <PasswordInput id="signup-password" name="password" placeholder="Create a password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating account...' : 'Create Admin Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default AdminAuth;