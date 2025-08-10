import { useState } from "react";
import { Plus, Users, Edit, Trash2, Clock, Tag, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CoachFormModal } from "@/components/coaches/CoachFormModal";
import { CoachScheduleModal } from "@/components/coaches/CoachScheduleModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Coach {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  specialty_tags: string[];
  is_available: boolean;
  bio: string | null;
  experience_years: number | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

const AdminCoaches = () => {
  const { signOut, user } = useAdminAuth();
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const queryClient = useQueryClient();

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Coach[];
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from("coaches")
        .update({ is_available: isAvailable })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Coach availability updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update coach availability");
      console.error("Error updating coach availability:", error);
    },
  });

  const deleteCoachMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coaches")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Coach deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete coach");
      console.error("Error deleting coach:", error);
    },
  });

  const handleAvailabilityToggle = (id: string, currentAvailability: boolean) => {
    updateAvailabilityMutation.mutate({ id, isAvailable: !currentAvailability });
  };

  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsCoachModalOpen(true);
  };

  const handleManageSchedule = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteCoach = (id: string) => {
    deleteCoachMutation.mutate(id);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar userType="admin" />
          <SidebarInset>
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
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

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Coaches Management</h1>
                  <p className="text-muted-foreground">Manage all available coaches and their schedules</p>
                </div>
                <Button onClick={() => {
                  setSelectedCoach(null);
                  setIsCoachModalOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Coach
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{coaches?.length || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Coaches</CardTitle>
                    <Users className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coaches?.filter(coach => coach.is_available)?.length || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Specialties</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coaches ? new Set(coaches.flatMap(coach => coach.specialty_tags)).size : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coaches Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Coaches</CardTitle>
                  <CardDescription>
                    View and manage all coaches in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="hidden md:table-cell">Phone</TableHead>
                          <TableHead>Specialties</TableHead>
                          <TableHead className="hidden lg:table-cell">Experience</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coaches?.map((coach) => (
                          <TableRow key={coach.id}>
                            <TableCell>
                              <div className="font-medium">{coach.name}</div>
                              {coach.bio && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {coach.bio}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{coach.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{coach.phone_number || "—"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {coach.specialty_tags?.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {coach.specialty_tags?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{coach.specialty_tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {coach.experience_years ? `${coach.experience_years} years` : "—"}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={coach.is_available}
                                onCheckedChange={() => handleAvailabilityToggle(coach.id, coach.is_available)}
                                disabled={updateAvailabilityMutation.isPending}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCoach(coach)}
                                  title="Edit Coach"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleManageSchedule(coach)}
                                  title="Manage Schedule"
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-destructive" title="Delete Coach">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Coach</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {coach.name}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteCoach(coach.id)}
                                        className="bg-destructive text-destructive-foreground"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Modals */}
              <CoachFormModal
                isOpen={isCoachModalOpen}
                onClose={() => {
                  setIsCoachModalOpen(false);
                  setSelectedCoach(null);
                }}
                coach={selectedCoach}
              />

              <CoachScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => {
                  setIsScheduleModalOpen(false);
                  setSelectedCoach(null);
                }}
                coach={selectedCoach}
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminCoaches;