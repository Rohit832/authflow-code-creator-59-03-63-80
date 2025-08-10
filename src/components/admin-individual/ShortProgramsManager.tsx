import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionFormModal } from './SessionFormModal';
import { SessionCard } from './SessionCard';

interface ShortProgram {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_inr: number;
  duration: string | null;
  thumbnail_url: string | null;
  session_url: string | null;
  access_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ShortProgramsManager = () => {
  const [programs, setPrograms] = useState<ShortProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ShortProgram | null>(null);
  const { toast } = useToast();

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('short_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load programs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleAdd = () => {
    setEditingProgram(null);
    setModalOpen(true);
  };

  const handleEdit = (program: ShortProgram) => {
    setEditingProgram(program);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const { error } = await supabase
        .from('short_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPrograms(programs.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Program deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting program:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete program',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    fetchPrograms();
    setModalOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Short Programs ({programs.length})</h3>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <SessionCard
            key={program.id}
            session={program}
            onEdit={() => handleEdit(program)}
            onDelete={() => handleDelete(program.id)}
          />
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No programs created yet</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create your first program
          </Button>
        </div>
      )}

      <SessionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        session={editingProgram}
        onSave={handleSave}
        tableName="short_programs"
      />
    </div>
  );
};