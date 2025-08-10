import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, User, Check, Paperclip, Image, Mic, FileText } from 'lucide-react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
  sender_id: string;
  message_type?: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'audio' | 'file';
  attachment_name?: string;
  attachment_size?: number;
  read_at?: string | null;
  read_by?: string[] | null;
}

interface AdminProfile {
  id: string;
  full_name: string;
  user_type: string;
  user_id: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  status: string;
  admin_id?: string;
  client_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessageDialog: React.FC<MessageDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useClientAuth();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📱 MessageDialog - Session check:', { hasSession: !!session, hasUser: !!session?.user });
        if (session?.user) {
          setCurrentUser(session.user);
          console.log('✅ MessageDialog - Current user set:', session.user.id);
        } else {
          console.log('❌ MessageDialog - No session or user found');
        }
      } catch (error) {
        console.error('💥 MessageDialog - Error getting session:', error);
      }
    };
    
    if (open) {
      getCurrentUser();
      fetchAdminProfiles();
    }
  }, [open]);

  useEffect(() => {
    if (currentUser) {
      console.log('🔄 MessageDialog - Fetching conversations for user:', currentUser.id);
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAdminProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, full_name, user_id, avatar_url')
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching admin profiles:', error);
        return;
      }

      const adminProfiles = data?.map(admin => ({
        ...admin,
        user_type: 'admin'
      })) || [];

      setAdminProfiles(adminProfiles);
    } catch (error) {
      console.error('Error in fetchAdminProfiles:', error);
    }
  };

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_conversations')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const typedConversations: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        status: conv.status,
        admin_id: conv.admin_id,
        client_id: conv.client_id,
        last_message_at: conv.last_message_at,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }));
      
      setConversations(typedConversations);
      
      // Auto-select first conversation if exists
      if (typedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(typedConversations[0]);
        fetchMessages(typedConversations[0].id);
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

      // Type the messages data properly
      const typedMessages: Message[] = (data || []).map(message => ({
        ...message,
        attachment_type: message.attachment_type as 'image' | 'audio' | 'file' | undefined
      }));

      setMessages(typedMessages);
      
      // Mark messages as read
      if (currentUser) {
        await supabase.rpc('mark_messages_as_read', {
          p_conversation_id: conversationId,
          p_user_id: currentUser.id,
          p_user_type: 'client'
        });
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const createNewConversation = async () => {
    console.log('🆕 Creating new conversation, currentUser:', currentUser?.id);
    
    if (!currentUser) {
      console.error('❌ No current user for creating conversation');
      toast({
        title: "Error",
        description: "Please refresh and try again",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📤 Attempting to create conversation for user:', currentUser.id);
      
      // First, ensure the client profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('💥 Error checking client profile:', profileCheckError);
        throw profileCheckError;
      }

      // If no profile exists, create one
      if (!existingProfile) {
        console.log('📝 Creating client profile for user:', currentUser.id);
        const { error: profileCreateError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Client'
          });

        if (profileCreateError) {
          console.error('💥 Error creating client profile:', profileCreateError);
          throw profileCreateError;
        }
      }
      
      const { data, error } = await supabase
        .from('client_conversations')
        .insert({
          client_id: currentUser.id,
          status: 'active'
        })
        .select()
        .maybeSingle();

      console.log('📥 Conversation creation result:', { data, error });

      if (error) {
        console.error('💥 Error creating conversation:', error);
        toast({
          title: "Error",
          description: `Failed to create conversation: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.error('💥 No data returned from conversation creation');
        toast({
          title: "Error", 
          description: "Failed to create conversation - no data returned",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Conversation created successfully:', data.id);
      const newConversation: Conversation = {
        id: data.id,
        status: data.status,
        admin_id: data.admin_id,
        client_id: data.client_id,
        last_message_at: data.last_message_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
      setMessages([]);
      
      toast({
        title: "Success",
        description: "New conversation started",
      });
      
    } catch (error) {
      console.error('💥 Exception in createNewConversation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          client_conversation_id: selectedConversation.id,
          sender_id: currentUser.id,
          sender_type: 'client',
          content: newMessage,
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: `Failed to send message: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setNewMessage('');
      fetchMessages(selectedConversation.id);
      
      // Update conversation's last_message_at
      await supabase
        .from('client_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'audio' | 'file') => {
    if (!selectedConversation || !currentUser) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const bucket = type === 'image' ? 'chat-images' : 'chat-audio';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          client_conversation_id: selectedConversation.id,
          sender_id: currentUser.id,
          sender_type: 'client',
          content: `Sent ${type === 'image' ? 'an image' : type === 'audio' ? 'an audio file' : 'a file'}`,
          message_type: type,
          attachment_url: data.publicUrl,
          attachment_type: type,
          attachment_name: file.name,
          attachment_size: file.size
        });

      if (messageError) {
        throw messageError;
      }

      fetchMessages(selectedConversation.id);
      toast({
        title: "Success",
        description: `${type} uploaded successfully`,
      });

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${type}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getAdminName = (adminId: string) => {
    const admin = adminProfiles.find(a => a.user_id === adminId);
    return admin?.full_name || 'Admin';
  };

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'image' && message.attachment_url) {
      return (
        <div className="space-y-2">
          <img 
            src={message.attachment_url} 
            alt={message.attachment_name || 'Image'} 
            className="max-w-xs rounded-lg border"
          />
          <p className="text-sm">{message.content}</p>
        </div>
      );
    }

    if (message.message_type === 'audio' && message.attachment_url) {
      return (
        <div className="space-y-2">
          <audio controls className="w-full max-w-xs">
            <source src={message.attachment_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <p className="text-sm">{message.content}</p>
        </div>
      );
    }

    if (message.message_type === 'file' && message.attachment_url) {
      return (
        <div className="space-y-2">
          <a 
            href={message.attachment_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <FileText className="w-4 h-4" />
            {message.attachment_name || 'Download file'}
          </a>
          <p className="text-sm">{message.content}</p>
        </div>
      );
    }

    return <p>{message.content}</p>;
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messages
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex min-h-0">
          {/* Conversations List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-3 border-b">
              <Button 
                onClick={createNewConversation}
                className="w-full"
                size="sm"
              >
                New Conversation
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length > 0 ? (
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
                             Support Team
                           </span>
                        </div>
                        <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                          {conversation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">Start a new conversation to get help</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Support Team</h3>
                      <p className="text-xs text-gray-500">Always here to help</p>
                    </div>
                  </div>
                </div>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${
                            message.sender_type === 'client' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            {/* Avatar */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                              message.sender_type === 'client' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {message.sender_type === 'client' 
                                ? (currentUser?.user_metadata?.full_name || currentUser?.email || 'C')[0].toUpperCase()
                                : 'S'
                              }
                            </div>
                            
                            <div className={`flex flex-col ${
                              message.sender_type === 'client' ? 'items-end' : 'items-start'
                            }`}>
                              {/* Sender Name */}
                              <span className="text-xs text-gray-500 mb-1 px-1">
                                {message.sender_type === 'client' 
                                  ? (currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'You')
                                  : 'Support Team'
                                }
                              </span>
                              
                              {/* Message Bubble */}
                              <div
                                className={`rounded-lg p-3 ${
                                  message.sender_type === 'client'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {renderMessageContent(message)}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs opacity-70">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                  </span>
                                  {message.sender_type === 'client' && message.read_at && (
                                    <Check className="w-3 h-3 opacity-70" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Send your first message below</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => audioInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || uploading}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                  )}
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const isImage = file.type.startsWith('image/');
                      handleFileUpload(file, isImage ? 'image' : 'file');
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, 'audio');
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;