import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { LogOut, MessageSquare, User, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';


interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  sender_id: string;
  message_type?: string;
  client_conversation_id: string;
}

interface ClientConversation {
  id: string;
  client_id: string;
  admin_id?: string;
  status: string;
  last_message_at: string;
  created_at: string;
  client_profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

const AdminMessages = () => {
  const { signOut, user } = useAdminAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ClientConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time subscriptions
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`admin-chat-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_conversations')
        .select(`
          *,
          client_profiles!inner(full_name, avatar_url)
        `)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
        return;
      }

      setConversations(data || []);
      
      // Auto-select first conversation if exists
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
        fetchMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('client_conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
      
      // Mark messages as read
      if (user) {
        await supabase.rpc('mark_messages_as_read', {
          p_conversation_id: conversationId,
          p_user_id: user.user_id,
          p_user_type: 'admin'
        });
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          client_conversation_id: selectedConversation.id,
          sender_id: user.user_id,
          sender_type: 'admin',
          content: newMessage,
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setNewMessage('');
      fetchMessages(selectedConversation.id);
      
      // Update conversation's last_message_at and assign admin
      await supabase
        .from('client_conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          admin_id: user.user_id
        })
        .eq('id', selectedConversation.id);

      // Refresh conversations to show updated data
      fetchConversations();

    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar userType="admin" />
      
      <SidebarInset>
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <select className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-black font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer min-w-[80px]">
                  <option className="text-black bg-white">English</option>
                </select>
                <select className="text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-black font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 cursor-pointer min-w-[120px]">
                  <option className="text-black bg-white">Asia/Kolkata</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Send SOS details</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)] flex">
            {/* Conversations List */}
            <div className="w-1/3 border-r flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Client Conversations
                </h3>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          fetchMessages(conversation.id);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium text-sm">
                              {conversation.client_profiles?.full_name || 'Client'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
                            {conversation.status}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message_at))} ago
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No conversations yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedConversation.client_profiles?.full_name || 'Client'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Started {formatDistanceToNow(new Date(selectedConversation.created_at))} ago
                    </p>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              message.sender_type === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {formatDistanceToNow(new Date(message.created_at))} ago
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
    </SidebarProvider>
  );
};

export default AdminMessages;