import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, User, UserCheck } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface ChatMessageAreaProps {
  conversationId: string;
  conversation?: Conversation;
}

export const ChatMessageArea = ({ conversationId, conversation }: ChatMessageAreaProps) => {
  const { user: adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      
      // Fetch messages from chat_messages table for this user conversation
      const { data: chatMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!adminUser) return false;

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: adminUser.user_id,
          receiver_id: conversationId, // Send to the individual user
          sender_type: 'admin',
          message: content,
          session_id: conversation?.item_id || 'general-support'
        });

      if (error) throw error;

      // Refresh messages
      fetchMessages();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Set up real-time subscription for chat messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`admin-chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // For admin messages, we need to determine if this conversation has course context
    // by checking the latest user message for course context
    let messageContent = newMessage;
    const lastUserMessage = messages.find(msg => msg.sender_type === 'individual');
    if (lastUserMessage && lastUserMessage.message.includes('[Course:')) {
      const courseMatch = lastUserMessage.message.match(/^\[Course: (.*?)\]/);
      if (courseMatch) {
        messageContent = `[Course: ${courseMatch[1]}] ${newMessage}`;
      }
    }

    console.log('Admin sending message with context:', messageContent);
    const success = await sendMessage(messageContent);
    if (success) {
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {conversation && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{conversation.user_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {conversation.item_title}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {conversation.item_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading && (
            <div className="text-center text-muted-foreground">
              Loading messages...
            </div>
          )}
          
          {!loading && messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <div className="bg-muted/30 rounded-lg p-6">
                <h4 className="font-medium mb-2">Start the conversation</h4>
                <p className="text-sm">Send the first message to begin chatting with this user about their session.</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => {
            const isAdmin = message.sender_type === 'admin';
            return (
              <div
                key={message.id}
                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isAdmin
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isAdmin ? (
                      <UserCheck className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-70">
                      {isAdmin ? 'Admin' : conversation?.user_name || 'User'}
                    </span>
                  </div>
                  
                  <p className="text-sm">{message.message}</p>
                  
                  <p className="text-xs opacity-70 mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};