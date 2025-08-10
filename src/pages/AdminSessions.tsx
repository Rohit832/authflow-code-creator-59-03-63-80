import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardImage } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Clock, Users, MapPin, LogOut, Edit, Trash2, Upload, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { AdminIndividualSessionsManagement } from '@/components/admin-individual-sessions/AdminIndividualSessionsManagement';


interface Session {
  id: string;
  title: string;
  description: string;
  session_date: string;
  session_time: string;
  duration: string;
  max_participants?: number | null;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  session_type: '1:1' | 'group';
  image_url?: string | null;
  admin_id?: string | null;
  credits_required: number;
  created_at?: string;
  updated_at?: string;
}

interface ClientCredit {
  user_id: string;
  full_name: string;
  email: string;
  coaching_credits: number;
  group_credits: number;
  total_credits: number;
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clientCredits, setClientCredits] = useState<ClientCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('1:1');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const { signOut, user } = useAdminAuth();

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    session_date: '',
    session_time: '',
    duration: '',
    max_participants: '',
    location: '',
    session_type: '1:1' as '1:1' | 'group',
    image_url: '',
    credits_required: '1'
  });

  useEffect(() => {
    fetchSessions();
    fetchClientCredits();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('Fetching sessions...');
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      console.log('Sessions fetched:', data);
      console.log('Number of sessions:', data?.length || 0);
      
      setSessions((data || []) as Session[]);
      
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} consultation slots`,
      });
    } catch (error) {
      console.error('Session fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch consultation slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientCredits = async () => {
    try {
      setCreditsLoading(true);
      console.log('Fetching client credits...');
      
      // Get all profiles that are clients with their user_id
      const { data: profiles, error: profilesError } = await supabase
        .from('client_profiles')
        .select('user_id, full_name');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles);

      // Get all credits for client users
      const { data: credits, error: creditsError } = await supabase
        .from('credits')
        .select('user_id, service_type, amount');

      if (creditsError) {
        console.error('Error fetching credits:', creditsError);
        throw creditsError;
      }

      console.log('Credits fetched:', credits);

      // Process the data to combine profiles with their credits
      const clientCreditsData: ClientCredit[] = (profiles || []).map(profile => {
        const userCredits = (credits || []).filter(c => c.user_id === profile.user_id);
        const coachingCredits = userCredits.find(c => c.service_type === 'coaching')?.amount || 0;
        const groupCredits = userCredits.find(c => c.service_type === 'short_session')?.amount || 0;
        
        const clientData = {
          user_id: profile.user_id,
          full_name: profile.full_name || 'Unknown',
          email: `${profile.full_name?.toLowerCase().replace(' ', '')}@email.com` || 'No email',
          coaching_credits: coachingCredits,
          group_credits: groupCredits,
          total_credits: coachingCredits + groupCredits
        };
        
        console.log('Client data processed:', clientData);
        return clientData;
      });

      console.log('Final client credits data:', clientCreditsData);
      setClientCredits(clientCreditsData);
      
      toast({
        title: "Success",
        description: `Loaded ${clientCreditsData.length} client records`,
      });
    } catch (error) {
      console.error('Error fetching client credits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client credits",
        variant: "destructive",
      });
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Convert to WebP format first
        const { convertToWebP } = await import('@/lib/imageUtils');
        const webpFile = await convertToWebP(file, 0.92);
        
        setSelectedImage(webpFile);
        
        // Create a unique filename with webp extension
        const originalName = file.name.split('.').slice(0, -1).join('');
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('session-images')
          .upload(fileName, webpFile);

        if (error) {
          throw error;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('session-images')
          .getPublicUrl(fileName);

        setNewSession({...newSession, image_url: publicUrl});
        
        toast({
          title: "Success",
          description: "Image uploaded and converted to WebP successfully",
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast({
          title: "Error",
          description: "Failed to upload and convert image",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddSession = async () => {
    if (!newSession.title || !newSession.session_date || !newSession.session_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const sessionData = {
        title: newSession.title,
        description: newSession.description,
        session_date: newSession.session_date,
        session_time: newSession.session_time,
        duration: newSession.duration || '60 mins',
        max_participants: newSession.session_type === 'group' ? parseInt(newSession.max_participants) || 8 : null,
        location: newSession.location,
        session_type: newSession.session_type,
        image_url: newSession.image_url,
        credits_required: parseInt(newSession.credits_required) || 1,
        admin_id: user?.user_id
      };

      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', editingSession.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Consultation slot updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([sessionData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Consultation slot created successfully",
        });
      }

      await fetchSessions();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save consultation slot",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewSession({
      title: '',
      description: '',
      session_date: '',
      session_time: '',
      duration: '',
      max_participants: '',
      location: '',
      session_type: '1:1',
      image_url: '',
      credits_required: '1'
    });
    setSelectedImage(null);
    setEditingSession(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setNewSession({
      title: session.title,
      description: session.description,
      session_date: session.session_date,
      session_time: session.session_time,
      duration: session.duration,
      max_participants: session.max_participants?.toString() || '',
      location: session.location,
      session_type: session.session_type,
      image_url: session.image_url || '',
      credits_required: session.credits_required?.toString() || '1'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Consultation slot deleted successfully",
      });

      await fetchSessions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete consultation slot",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => session.session_type === activeTab);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar userType="admin" />
          <SidebarInset>
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading consultation slots...</p>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userType="admin" />
        <SidebarInset>
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <select className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-black font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer min-w-[80px]">
                  <option className="text-black bg-white">English</option>
                </select>
                <select className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-black font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer min-w-[120px]">
                  <option className="text-black bg-white">Asia/Kolkata</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Send SOS details</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-6">
          <Tabs defaultValue="consultation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="consultation">Consultation Slots</TabsTrigger>
              <TabsTrigger value="individual">Individual Sessions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="consultation" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Consultation Slots</h1>
                  <p className="text-gray-600">Manage your 1:1 and group consultation bookings</p>
                </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingSession(null);
                    resetForm();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Consultation Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                <DialogTitle>
                  {editingSession ? 'Edit Consultation Slot' : 'Create New Consultation Slot'}
                </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <Label htmlFor="image">Coach Profile Image</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                         {newSession.image_url ? (
                           <img
                             src={newSession.image_url}
                             alt="Coach preview"
                             className="w-full h-full object-cover rounded-lg"
                           />
                         ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-500">Upload coach profile image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                   
                   <div>
                     <Label htmlFor="session-type">Consultation Type</Label>
                     <Select value={newSession.session_type} onValueChange={(value: '1:1' | 'group') => setNewSession({...newSession, session_type: value})}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="1:1">1:1 Private Consultation</SelectItem>
                         <SelectItem value="group">Group Consultation</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                  
                  <div>
                    <Label htmlFor="title">Consultation Title *</Label>
                    <Input 
                      id="title"
                      value={newSession.title}
                      onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                      placeholder="e.g., Financial Planning Strategy Call"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Consultation Description</Label>
                    <Textarea 
                      id="description"
                      value={newSession.description}
                      onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                      placeholder="What will be covered in this consultation..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="date">Date *</Label>
                       <Input 
                         id="date"
                         type="date"
                         value={newSession.session_date}
                         onChange={(e) => setNewSession({...newSession, session_date: e.target.value})}
                       />
                     </div>
                     <div>
                       <Label htmlFor="time">Time *</Label>
                       <Input 
                         id="time"
                         type="time"
                         value={newSession.session_time}
                         onChange={(e) => setNewSession({...newSession, session_time: e.target.value})}
                       />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                       <Input 
                         id="duration"
                         value={newSession.duration}
                         onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                         placeholder="60 mins"
                       />
                     </div>
                     {newSession.session_type === 'group' && (
                       <div>
                         <Label htmlFor="maxParticipants">Max Participants</Label>
                         <Input 
                           id="maxParticipants"
                           type="number"
                           value={newSession.max_participants}
                           onChange={(e) => setNewSession({...newSession, max_participants: e.target.value})}
                           placeholder="8"
                         />
                       </div>
                      )}
                   </div>
                   
                   <div>
                     <Label htmlFor="credits">Credits Required</Label>
                     <Input 
                       id="credits"
                       type="number"
                       min="1"
                       value={newSession.credits_required}
                       onChange={(e) => setNewSession({...newSession, credits_required: e.target.value})}
                       placeholder="1"
                     />
                   </div>
                   
                   <div>
                     <Label htmlFor="location">Location</Label>
                     <Input 
                       id="location"
                       value={newSession.location}
                       onChange={(e) => setNewSession({...newSession, location: e.target.value})}
                       placeholder="Zoom Call / Office"
                     />
                   </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddSession} className="flex-1">
                      {editingSession ? 'Update Consultation Slot' : 'Create Consultation Slot'}
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1:1">1:1 Consultations</TabsTrigger>
              <TabsTrigger value="group">Group Consultations</TabsTrigger>
              <TabsTrigger value="credits">Client Credits</TabsTrigger>
              <TabsTrigger value="session-links">Session Links</TabsTrigger>
            </TabsList>
            
            <TabsContent value="1:1" className="space-y-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border shadow-sm hover:scale-[1.02] rounded-lg">
                    <div className="relative">
                      {/* Image Section */}
                      <div className="relative overflow-hidden rounded-t-lg">
                        {session.image_url ? (
                          <CardImage
                            src={session.image_url}
                            alt={session.title}
                            height="h-24"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(session)}
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{session.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{session.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-blue-600">
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">Available</span>
                          </div>
                          <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            <CreditCard className="h-3 w-3" />
                            <span className="font-medium">{session.credits_required} Credit{session.credits_required > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 text-white p-2 rounded text-xs">
                          <div className="font-semibold">
                            {new Date(session.session_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} - {session.session_time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="group" className="space-y-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border shadow-sm hover:scale-[1.02] rounded-lg">
                    <div className="relative">
                      {/* Image Section */}
                      <div className="relative overflow-hidden rounded-t-lg">
                        {session.image_url ? (
                          <CardImage
                            src={session.image_url}
                            alt={session.title}
                            height="h-24"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(session)}
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                          className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{session.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{session.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-green-700">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">{session.max_participants} max</span>
                          </div>
                          <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            <CreditCard className="h-3 w-3" />
                            <span className="font-medium">{session.credits_required} Credit{session.credits_required > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900 text-white p-2 rounded text-xs">
                          <div className="font-semibold">
                            {new Date(session.session_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} - {session.session_time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="credits" className="space-y-4">
              {creditsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading client credits...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientCredits.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No client credits found</h3>
                      <p className="text-gray-600">Client credits will appear here once they are assigned</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {clientCredits.map((client) => (
                        <Card key={client.user_id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">{client.full_name}</h3>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span>1:1 Credits: <strong>{client.coaching_credits}</strong></span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <span>Group Credits: <strong>{client.group_credits}</strong></span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">{client.total_credits}</div>
                              <div className="text-xs text-muted-foreground">Total Credits</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="session-links" className="space-y-4">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Session Links Manager is not available</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {(activeTab === '1:1' || activeTab === 'group') && filteredSessions.length === 0 && !loading && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation slots yet</h3>
              <p className="text-gray-600 mb-4">Create your first {activeTab === '1:1' ? 'private' : 'group'} consultation slot to get started</p>
              <Button onClick={() => {
                setEditingSession(null);
                resetForm();
                setIsDialogOpen(true);
              }} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Consultation Slot
              </Button>
            </div>
          )}
            </TabsContent>
            
            <TabsContent value="individual" className="space-y-6">
              <AdminIndividualSessionsManagement />
            </TabsContent>
          </Tabs>
        </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
