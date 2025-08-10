import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionFormModal } from './SessionFormModal';
import { SessionCard } from './SessionCard';

interface FinancialTool {
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

export const FinancialToolsManager = () => {
  const [tools, setTools] = useState<FinancialTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<FinancialTool | null>(null);
  const { toast } = useToast();

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tools',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleAdd = () => {
    setEditingTool(null);
    setModalOpen(true);
  };

  const handleEdit = (tool: FinancialTool) => {
    setEditingTool(tool);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const { error } = await supabase
        .from('financial_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTools(tools.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Tool deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tool',
        variant: 'destructive',
      });
    }
  };

  const handleSave = () => {
    fetchTools();
    setModalOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Financial Tools ({tools.length})</h3>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <SessionCard
            key={tool.id}
            session={tool}
            onEdit={() => handleEdit(tool)}
            onDelete={() => handleDelete(tool.id)}
          />
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tools created yet</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create your first tool
          </Button>
        </div>
      )}

      <SessionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        session={editingTool}
        onSave={handleSave}
        tableName="financial_tools"
      />
    </div>
  );
};