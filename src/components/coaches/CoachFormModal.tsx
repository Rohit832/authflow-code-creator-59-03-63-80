import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

interface CoachFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach?: Coach | null;
}

const predefinedTags = [
  "Tax Planning",
  "SIP",
  "Retirement Strategy",
  "Investment Planning",
  "Portfolio Management",
  "Mutual Funds",
  "Goal Planning",
  "Insurance Planning",
  "Estate Planning",
  "Financial Planning"
];

export const CoachFormModal = ({ isOpen, onClose, coach }: CoachFormModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    bio: "",
    experience_years: "",
    profile_image_url: ""
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (coach) {
      setFormData({
        name: coach.name,
        email: coach.email,
        phone_number: coach.phone_number || "",
        bio: coach.bio || "",
        experience_years: coach.experience_years?.toString() || "",
        profile_image_url: coach.profile_image_url || ""
      });
      setSelectedTags(coach.specialty_tags || []);
    } else {
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        bio: "",
        experience_years: "",
        profile_image_url: ""
      });
      setSelectedTags([]);
    }
    setCustomTag("");
  }, [coach, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (coach) {
        const { error } = await supabase
          .from("coaches")
          .update(data)
          .eq("id", coach.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("coaches")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success(coach ? "Coach updated successfully" : "Coach created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(coach ? "Failed to update coach" : "Failed to create coach");
      console.error("Error saving coach:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number || null,
      bio: formData.bio || null,
      experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      profile_image_url: formData.profile_image_url || null,
      specialty_tags: selectedTags,
      is_available: coach?.is_available ?? true
    };

    saveMutation.mutate(data);
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      handleAddTag(customTag.trim());
      setCustomTag("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coach ? "Edit Coach" : "Add New Coach"}</DialogTitle>
          <DialogDescription>
            {coach ? "Update coach information and specialties." : "Add a new coach to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief description of the coach's expertise and background"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_image">Profile Image URL</Label>
            <Input
              id="profile_image"
              value={formData.profile_image_url}
              onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-3">
            <Label>Specialties</Label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Predefined Tags */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Select from predefined specialties:</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        handleRemoveTag(tag);
                      } else {
                        handleAddTag(tag);
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom specialty"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddCustomTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : coach ? "Update Coach" : "Create Coach"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};