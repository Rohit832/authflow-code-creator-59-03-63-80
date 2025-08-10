import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface SessionCardProps {
  session: {
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
  };
  onEdit: () => void;
  onDelete: () => void;
}

export const SessionCard = ({ session, onEdit, onDelete }: SessionCardProps) => {
  const handleJoinSession = () => {
    if (session.session_url) {
      window.open(session.session_url, '_blank');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
          <div className="flex items-center gap-1 ml-2">
            {session.is_active ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        {session.category && (
          <Badge variant="secondary" className="w-fit">
            {session.category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        {session.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {session.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold text-primary">₹{session.price_inr.toLocaleString()}</span>
          </div>
          
          {session.duration && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span>{session.duration}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Access:</span>
            <Badge variant="outline" className="text-xs">
              {session.access_type}
            </Badge>
          </div>
          
          {session.session_url && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session URL:</span>
              <span className="text-xs text-green-600">Available</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          {session.session_url && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={handleJoinSession}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Join
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};