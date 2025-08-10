import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface IndividualSession {
  id: string;
  title: string;
  description: string | null;
  session_type: 'one-on-one' | 'short-program' | 'self-guided-tool';
  duration: string | null;
  price_inr: number;
  tags: string[] | null;
  is_active: boolean;
}

interface AdminIndividualSessionModalProps {
  session: IndividualSession | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const AdminIndividualSessionModal = ({
  session,
  open,
  onClose,
  onSave,
}: AdminIndividualSessionModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    session_type: 'one-on-one' as 'one-on-one' | 'short-program' | 'self-guided-tool',
    duration: '',
    price_inr: '',
    tags: [] as string[],
    is_active: true,
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title,
        description: session.description || '',
        session_type: session.session_type,
        duration: session.duration || '',
        price_inr: session.price_inr.toString(),
        tags: session.tags || [],
        is_active: session.is_active,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        session_type: 'one-on-one',
        duration: '',
        price_inr: '',
        tags: [],
        is_active: true,
      });
    }
  }, [session]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sessionData = {
        title: formData.title,
        description: formData.description || null,
        session_type: formData.session_type,
        duration: formData.duration || null,
        price_inr: parseInt(formData.price_inr),
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_active: formData.is_active,
      };

      if (session) {
        // Update existing session
        const { error } = await supabase
          .from('individual_sessions')
          .update(sessionData)
          .eq('id', session.id);

        if (error) throw error;

        toast({
          title: "Session Updated",
          description: "The session has been updated successfully.",
        });
      } else {
        // Create new session
        const { error } = await supabase
          .from('individual_sessions')
          .insert(sessionData);

        if (error) throw error;

        toast({
          title: "Session Created",
          description: "The session has been created successfully.",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {session ? 'Edit Session' : 'Create New Session'}
          </DialogTitle>
          <DialogDescription>
            {session ? 'Update the session details below.' : 'Fill in the details to create a new session.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session_type">Session Type *</Label>
              <Select
                value={formData.session_type}
                onValueChange={(value: 'one-on-one' | 'short-program' | 'self-guided-tool') =>
                  setFormData(prev => ({ ...prev, session_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-on-one">One-on-One</SelectItem>
                  <SelectItem value="short-program">Short Program</SelectItem>
                  <SelectItem value="self-guided-tool">Self-Guided Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 60 minutes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_inr">Price (INR) *</Label>
              <Input
                id="price_inr"
                type="number"
                value={formData.price_inr}
                onChange={(e) => setFormData(prev => ({ ...prev, price_inr: e.target.value }))}
                required
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag}>Add</Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (session ? 'Update Session' : 'Create Session')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};