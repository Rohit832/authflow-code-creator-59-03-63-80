import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIndividualAuth } from '@/hooks/useIndividualAuth';

import { usePurchasedCourses } from '@/hooks/usePurchasedCourses';
import { PurchasedCoursesSidebar } from '@/components/chat/PurchasedCoursesSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface PurchasedCourse {
  id: string;
  item_id: string;
  item_type: 'one_on_one' | 'short_program' | 'financial_tool';
  purchase_date: string;
  status: string;
  course_title: string;
  course_description?: string;
  price_paid: number;
}

export default function IndividualChat() {
  console.log('IndividualChat component mounted');
  const { user } = useIndividualAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<PurchasedCourse | null>(null);

  const {
    purchasedCourses,
    loading: coursesLoading
  } = usePurchasedCourses(user?.id || null);

  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/individual-auth');
      return;
    }
    
    fetchMessages();
    setLoading(false);

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('individual-chat-messages')
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
  }, [user?.id, selectedCourse?.item_id]); // Refetch when course changes

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setMessagesLoading(true);
      
      // Fetch messages from chat_messages table for this user with proper filtering
      let query = supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      // Filter based on selected course
      if (selectedCourse) {
        // For course-specific chat, filter by session_id
        query = query.eq('session_id', selectedCourse.item_id);
      } else {
        // For general support, get messages with null session_id
        query = query.is('session_id', null);
      }

      const { data: chatMessages, error } = await query;

      if (error) throw error;

      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user) return false;

    try {
      setSending(true);
      
      // Use session_id only if course is selected, otherwise null
      const sessionId = selectedCourse?.item_id || null;
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          sender_type: 'individual',
          message: content,
          session_id: sessionId
        });

      if (error) throw error;

      // Refresh messages
      await fetchMessages();
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    // Add course context to message if a course is selected
    let messageContent = newMessage;
    if (selectedCourse) {
      messageContent = `[Course: ${selectedCourse.course_title}] ${newMessage}`;
    }

    const success = await sendMessage(messageContent);
    if (success) {
      setNewMessage('');
    }
  };

  const handleCourseSelect = (course: PurchasedCourse | null) => {
    setSelectedCourse(course);
    // Conversation will be refetched due to useEffect dependency
  };

  const handleBackToDashboard = () => {
    navigate('/individual-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="flex items-center justify-between w-full mb-3">
            <Button variant="outline" size="sm" onClick={handleBackToDashboard} className="gap-2">
              <ArrowLeft className="h-3 w-3" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Chat with Coach</h1>
              <p className="text-xs text-muted-foreground">
                {selectedCourse 
                  ? `Discussing: ${selectedCourse.course_title}`
                  : 'Get support for your financial planning needs'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar - Purchased Courses */}
          <div className="lg:col-span-1 h-[300px] lg:h-[calc(100vh-200px)]">
            <PurchasedCoursesSidebar
              courses={purchasedCourses}
              selectedCourse={selectedCourse}
              onSelectCourse={handleCourseSelect}
              loading={coursesLoading}
            />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 h-[calc(100vh-400px)] lg:h-[calc(100vh-200px)]">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b flex-shrink-0 p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {selectedCourse ? selectedCourse.course_title : 'General Support'}
                      </span>
                    </CardTitle>
                    {selectedCourse && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {selectedCourse.course_description || `${selectedCourse.item_type} session`}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2 flex-shrink-0 text-xs">
                    {messages.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2">
                    {messagesLoading && (
                      <div className="text-center text-muted-foreground py-4">
                        <div className="animate-pulse text-xs">Loading messages...</div>
                      </div>
                    )}
                    
                    {!messagesLoading && messages.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        <div className="bg-muted/30 rounded-lg p-3 mx-auto max-w-sm">
                          <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                          <h4 className="font-medium mb-1 text-xs">
                            {selectedCourse ? `Chat about ${selectedCourse.course_title}` : 'Welcome to Support Chat'}
                          </h4>
                          <p className="text-xs leading-relaxed">
                            {selectedCourse 
                              ? `Ask questions about your purchased course. An admin will respond soon.`
                              : 'An admin will respond to your messages soon. Feel free to ask questions.'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {messages.map((message) => {
                      const isUser = message.sender_type === 'individual';
                      
                      // Extract course context from message if present
                      let displayContent = message.message;
                      let courseContext = null;
                      const courseMatch = message.message.match(/^\[Course: (.*?)\] (.*)$/);
                      if (courseMatch) {
                        courseContext = courseMatch[1];
                        displayContent = courseMatch[2];
                      }
                     
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          <div
                            className={`max-w-[85%] lg:max-w-[70%] rounded-lg p-2 ${
                              isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs opacity-70 font-medium">
                                {isUser ? 'You' : 'Coach'}
                              </span>
                              {courseContext && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  {courseContext}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs leading-relaxed break-words">{displayContent}</p>
                            
                            <p className="text-xs opacity-60 mt-1">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-2 border-t bg-background flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        selectedCourse 
                          ? `Ask about ${selectedCourse.course_title}...`
                          : "Type your message..."
                      }
                      disabled={sending}
                      className="flex-1 text-xs h-8"
                    />
                    <Button type="submit" disabled={!newMessage.trim() || sending} size="sm" className="px-2 h-8">
                      <Send className="h-3 w-3" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}