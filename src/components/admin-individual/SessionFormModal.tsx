import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: any;
  onSave: () => void;
  tableName: 'one_on_one_sessions' | 'short_programs' | 'financial_tools';
}

export const SessionFormModal = ({ 
  open, 
  onOpenChange, 
  session, 
  onSave,
  tableName 
}: SessionFormModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price_inr: 0,
    duration: '',
    thumbnail_url: '',
    session_url: '',
    access_type: 'premium',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        category: session.category || '',
        price_inr: session.price_inr || 0,
        duration: session.duration || '',
        thumbnail_url: session.thumbnail_url || '',
        session_url: session.session_url || '',
        access_type: session.access_type || 'premium',
        is_active: session.is_active ?? true,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        price_inr: 0,
        duration: '',
        thumbnail_url: '',
        session_url: '',
        access_type: 'premium',
        is_active: true,
      });
    }
  }, [session, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const payload = {
        ...formData,
        admin_id: userData.user?.id,
      };

      if (session) {
        const { error } = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', session.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert([payload]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Item created successfully',
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save item',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {session ? 'Edit' : 'Add'} {tableName.replace(/_/g, ' ').replace(/s$/, '')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Finance, Investment"
              />
            </div>

            <div>
              <Label htmlFor="price_inr">Price (₹) *</Label>
              <Input
                id="price_inr"
                type="number"
                value={formData.price_inr}
                onChange={(e) => handleChange('price_inr', Number(e.target.value))}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 60 minutes, 2 weeks"
              />
            </div>

            <div>
              <Label htmlFor="access_type">Access Type</Label>
              <Select value={formData.access_type} onValueChange={(value) => handleChange('access_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="session_url">Session URL</Label>
              <Input
                id="session_url"
                value={formData.session_url}
                onChange={(e) => handleChange('session_url', e.target.value)}
                placeholder="https://meet.google.com/... or https://zoom.us/..."
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active (visible to users)</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : session ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};