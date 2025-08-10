import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Upload, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';
import { CompleteSignupForm } from '@/components/client-auth/CompleteSignupForm';
import { supabase } from '@/integrations/supabase/client';
const ClientAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp } = useClientAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;

    try {
      // Check if registration request already exists
      const { data: existingRegistration } = await supabase
        .from('client_registrations')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

      if (existingRegistration) {
        if (existingRegistration.status === 'pending') {
          toast({
            title: 'Request Already Exists',
            description: 'Registration request already submitted and pending approval.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        } else if (existingRegistration.status === 'approved') {
          toast({
            title: 'Already Approved',
            description: 'Registration approved. Please use the Complete tab to finish signup.',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
      }

      // Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = data.publicUrl;
        }
      }

      // Create registration request for admin approval
      const { error: registrationError } = await supabase
        .from('client_registrations')
        .insert({
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          status: 'pending'
        });

      if (registrationError) {
        throw registrationError;
      }

      toast({
        title: 'Success',
        description: 'Registration request submitted successfully! Please wait for admin approval.'
      });
      
      (e.target as HTMLFormElement).reset();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit registration request',
        variant: 'destructive'
      });
    }
    setIsLoading(false);
  };


  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const jobTitle = formData.get('jobTitle') as string;

    const { error } = await signUp({
      email,
      password,
      full_name: fullName,
      phone_number: phone,
      company_name: company,
      job_title: jobTitle
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
        description: 'Registration request submitted successfully! Please wait for admin approval.'
      });
      (e.target as HTMLFormElement).reset();
      setAvatarFile(null);
      setAvatarPreview(null);
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
    const { error } = await signIn(email, password);
    if (error) {
      setSignInError(error.message);
    } else {
      // Navigate to client dashboard on successful sign in
      navigate('/client-dashboard');
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 p-4">
      <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 left-4 flex items-center gap-2 text-sm">
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden">Back</span>
      </Button>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary">Finsage Consult</h2>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Client Portal</CardTitle>
          
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="signin" className="text-xs px-2 py-2 h-auto">Sign In</TabsTrigger>
              <TabsTrigger value="request" className="text-xs px-1 py-2 h-auto">Request</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs px-1 py-2 h-auto">Complete</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              {showForgotPassword ? <ForgotPasswordForm userType="client" onBack={() => setShowForgotPassword(false)} /> : <form onSubmit={handleSignIn} className="space-y-4">
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

            <TabsContent value="request" className="space-y-4">
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="request-email">Email</Label>
                  <Input id="request-email" name="email" type="email" placeholder="Enter your email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-name">Full Name</Label>
                  <Input id="request-name" name="fullName" type="text" placeholder="Enter your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-avatar">Profile Picture</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="request-avatar" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Choose Image</p>
                        </div>
                      )}
                      <input id="request-avatar" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Submitting request...' : 'Request Access'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <CompleteSignupForm 
                isLoading={isLoading} 
                setIsLoading={setIsLoading}
                onSuccess={() => {
                  // Additional success handling can be added here
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default ClientAuth;