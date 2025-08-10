import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MessageIconProps {
  hasCredits: boolean;
  unreadCount?: number;
  onClick: () => void;
  className?: string;
}

const MessageIcon: React.FC<MessageIconProps> = ({ 
  hasCredits, 
  unreadCount = 0, 
  onClick, 
  className 
}) => {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={!hasCredits}
        className={cn(
          "flex items-center gap-2",
          !hasCredits && "opacity-50 cursor-not-allowed",
          className
        )}
        title={!hasCredits ? "Insufficient credits to send messages" : "Messages"}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Messages</span>
      </Button>
      
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default MessageIcon;