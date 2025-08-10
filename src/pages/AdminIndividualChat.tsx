import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChatConversationsList } from '@/components/admin-individual-chat/ChatConversationsList';
import { ChatMessageArea } from '@/components/admin-individual-chat/ChatMessageArea';
import { MessageSquare, Search } from 'lucide-react';

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

export default function AdminIndividualChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch conversations from chat_messages table grouped by sender
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('sender_type', 'individual')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      // Group messages by sender_id to create conversations
      const conversationsMap = new Map();
      
      for (const message of messagesData || []) {
        if (!conversationsMap.has(message.sender_id)) {
          // Fetch user profile for this sender
          const { data: profileData } = await supabase
            .from('individual_profiles')
            .select('user_id, full_name, email')
            .eq('user_id', message.sender_id)
            .single();

          conversationsMap.set(message.sender_id, {
            id: message.sender_id, // Use sender_id as conversation id
            user_id: message.sender_id,
            item_id: message.session_id,
            item_type: 'individual_conversation',
            item_title: 'Individual User Chat',
            user_name: profileData?.full_name || 'Unknown User',
            last_message: message.message,
            last_message_at: message.created_at,
            unread_count: 0
          });
        }
      }

      const transformedConversations = Array.from(conversationsMap.values());
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Set up real-time subscription for new chat messages
    const channel = supabase
      .channel('admin-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.item_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar userType="admin" />
        
        <SidebarInset>
          <header className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Individual Chat Management</h1>
            </div>
          </header>

          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
            <div className="h-full max-w-7xl mx-auto">
              <div className="mb-4 lg:mb-6">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6" />
                  Individual Chat Management
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Manage conversations with individual session users</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)] sm:h-[calc(100vh-160px)]">
                {/* Conversations List */}
                <div className="lg:col-span-1 h-[50vh] lg:h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="p-4 pb-3 flex-shrink-0">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>Conversations</span>
                        <Badge variant="outline" className="text-xs">{filteredConversations.length}</Badge>
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search conversations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                      <ChatConversationsList
                        conversations={filteredConversations}
                        selectedConversation={selectedConversation}
                        onSelectConversation={setSelectedConversation}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Message Area */}
                <div className="lg:col-span-2 h-[50vh] lg:h-full">
                  <Card className="h-full">
                    <CardContent className="p-0 h-full">
                      {selectedConversation ? (
                        <ChatMessageArea
                          conversationId={selectedConversation}
                          conversation={conversations.find(c => c.id === selectedConversation)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-center p-4">
                          <div>
                            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Select a conversation</h3>
                            <p className="text-sm text-muted-foreground">Choose a conversation from the list to start chatting</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}