import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Coach {
  id: string;
  name: string;
  email: string;
}

interface CoachSchedule {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CoachScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach | null;
}

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const CoachScheduleModal = ({ isOpen, onClose, coach }: CoachScheduleModalProps) => {
  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: "",
    start_time: "",
    end_time: ""
  });
  const [editingSchedule, setEditingSchedule] = useState<CoachSchedule | null>(null);
  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["coach-schedules", coach?.id],
    queryFn: async () => {
      if (!coach?.id) return [];
      
      const { data, error } = await supabase
        .from("coach_schedules")
        .select("*")
        .eq("coach_id", coach.id)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      return data as CoachSchedule[];
    },
    enabled: !!coach?.id && isOpen,
  });

  useEffect(() => {
    if (editingSchedule) {
      setScheduleForm({
        day_of_week: editingSchedule.day_of_week.toString(),
        start_time: editingSchedule.start_time,
        end_time: editingSchedule.end_time
      });
    } else {
      setScheduleForm({
        day_of_week: "",
        start_time: "",
        end_time: ""
      });
    }
  }, [editingSchedule]);

  const saveScheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingSchedule) {
        const { error } = await supabase
          .from("coach_schedules")
          .update(data)
          .eq("id", editingSchedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("coach_schedules")
          .insert([{ ...data, coach_id: coach?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-schedules", coach?.id] });
      toast.success(editingSchedule ? "Schedule updated successfully" : "Schedule added successfully");
      setScheduleForm({ day_of_week: "", start_time: "", end_time: "" });
      setEditingSchedule(null);
    },
    onError: (error) => {
      toast.error(editingSchedule ? "Failed to update schedule" : "Failed to add schedule");
      console.error("Error saving schedule:", error);
    },
  });

  const updateScheduleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("coach_schedules")
        .update({ is_active: isActive })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-schedules", coach?.id] });
      toast.success("Schedule status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update schedule status");
      console.error("Error updating schedule status:", error);
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_schedules")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-schedules", coach?.id] });
      toast.success("Schedule deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete schedule");
      console.error("Error deleting schedule:", error);
    },
  });

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleForm.day_of_week || !scheduleForm.start_time || !scheduleForm.end_time) {
      toast.error("Please fill in all fields");
      return;
    }

    const data = {
      day_of_week: parseInt(scheduleForm.day_of_week),
      start_time: scheduleForm.start_time,
      end_time: scheduleForm.end_time,
      is_active: editingSchedule?.is_active ?? true
    };

    saveScheduleMutation.mutate(data);
  };

  const handleEditSchedule = (schedule: CoachSchedule) => {
    setEditingSchedule(schedule);
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setScheduleForm({ day_of_week: "", start_time: "", end_time: "" });
  };

  const getDayName = (dayNumber: number) => {
    return days.find(day => day.value === dayNumber)?.label || "";
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!coach) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Schedule - {coach.name}</DialogTitle>
          <DialogDescription>
            Set up weekly availability schedule for this coach
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </CardTitle>
              <CardDescription>
                {editingSchedule ? "Update existing schedule entry" : "Create a new availability slot"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSchedule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day of Week</Label>
                  <Select
                    value={scheduleForm.day_of_week}
                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, day_of_week: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={scheduleForm.start_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={scheduleForm.end_time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={saveScheduleMutation.isPending}>
                    {saveScheduleMutation.isPending ? "Saving..." : editingSchedule ? "Update" : "Add"}
                  </Button>
                  {editingSchedule && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Current Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Schedule</CardTitle>
              <CardDescription>
                All scheduled availability slots for {coach.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading schedules...</div>
              ) : schedules && schedules.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {getDayName(schedule.day_of_week)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={schedule.is_active}
                            onCheckedChange={(checked) =>
                              updateScheduleStatusMutation.mutate({
                                id: schedule.id,
                                isActive: checked
                              })
                            }
                            disabled={updateScheduleStatusMutation.isPending}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this schedule entry? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteScheduleMutation.mutate(schedule.id)}
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No schedules set up yet. Add the first availability slot using the form.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};