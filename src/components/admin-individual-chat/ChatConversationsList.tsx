import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  item_title: string;
  user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface ChatConversationsListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export const ChatConversationsList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ChatConversationsListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="divide-y">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations found
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                selectedConversation === conversation.id && "bg-muted"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{conversation.user_name}</h4>
                {conversation.unread_count > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {conversation.item_title}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {conversation.last_message}
              </p>
              
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};