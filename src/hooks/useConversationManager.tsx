import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_type: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
  message_type: string;
  read_at?: string | null;
  read_by?: string[] | null;
  updated_at?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_size?: number;
}

interface UseConversationManagerProps {
  conversationId: string | null;
  userId: string | null;
  userType: 'client' | 'admin' | 'coach' | 'individual';
  courseContext?: {
    course_title: string;
    item_id: string;
  } | null;
}

export const useConversationManager = ({ 
  conversationId, 
  userId, 
  userType,
  courseContext
}: UseConversationManagerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Load messages for the conversation
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('client_conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // Filter messages by course context if specified
      if (courseContext && userType === 'client') {
        // For course-specific context, show messages related to this course OR from admin
        query = query.or(`content.like.%5BCourse: ${courseContext.course_title}%5D%,sender_type.eq.admin`);
      } else if (!courseContext && userType === 'client') {
        // For general support, show messages NOT related to any course OR from admin  
        query = query.or(`content.not.like.%5BCourse:%,sender_type.eq.admin`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read if they're from other users
      if (userId && data && data.length > 0) {
        const unreadMessages = data.filter(msg => 
          msg.sender_id !== userId && 
          (!msg.read_at || !msg.read_by?.includes(userId))
        );

        if (unreadMessages.length > 0) {
          await markMessagesAsRead(unreadMessages.map(m => m.id));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId, userId, courseContext?.course_title, userType]);

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!userId || messageIds.length === 0) return;

    try {
      console.log('Marking messages as read:', messageIds);
      const { error } = await supabase
        .from('messages')
        .update({
          read_at: new Date().toISOString(),
          read_by: [userId]
        })
        .in('id', messageIds)
        .neq('sender_id', userId);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) && msg.sender_id !== userId
          ? { ...msg, read_at: new Date().toISOString(), read_by: [userId] }
          : msg
      ));
      
      console.log('Successfully marked messages as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!conversationId || !userId || !content.trim()) return false;

    console.log('Sending message:', { conversationId, userId, userType, content: content.slice(0, 50) + '...' });
    setSending(true);
    
    // Create optimistic message for immediate UI feedback
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      sender_type: userType,
      sender_id: userId,
      conversation_id: conversationId,
      message_type: 'text',
      created_at: new Date().toISOString()
    };
    
    // Add to UI immediately for better UX
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          client_conversation_id: conversationId,
          sender_id: userId,
          sender_type: userType,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);

      // Replace optimistic message with real saved message
      const realMessage: Message = {
        ...data,
        id: data.id,
        content: data.content,
        sender_type: data.sender_type,
        sender_id: data.sender_id,
        conversation_id: data.conversation_id,
        message_type: data.message_type,
        created_at: data.created_at
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? realMessage : msg
      ));

      // Update conversation's last message timestamp
      await supabase
        .from('client_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      toast({
        title: 'Message Sent',
        description: 'Your message has been delivered.',
      });

      console.log('Message stored permanently:', data);
      return true;
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Real-time message received:', payload);
          const newMessage = payload.new as Message;
          
          // Filter real-time messages by course context for clients
          let shouldShowMessage = true;
          if (userType === 'client') {
            if (courseContext) {
              // For course-specific context, show messages that include the course title
              shouldShowMessage = newMessage.content.includes(`[Course: ${courseContext.course_title}]`) ||
                                newMessage.sender_type === 'admin'; // Always show admin messages
            } else {
              // For general support, show messages that don't have course context or are from admin
              shouldShowMessage = !newMessage.content.includes('[Course:') ||
                                newMessage.sender_type === 'admin'; // Always show admin messages
            }
          }
          // For admin users, show all messages
          else if (userType === 'admin') {
            shouldShowMessage = true;
          }
          
          console.log('Should show message:', shouldShowMessage, 'Message:', newMessage.content);

          if (shouldShowMessage) {
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('Message already exists, skipping');
                return prev;
              }
              console.log('Adding new message to state');
              return [...prev, newMessage];
            });

            // Auto-mark as read if it's from another user
            if (newMessage.sender_id !== userId) {
              setTimeout(() => {
                console.log('Auto-marking message as read');
                markMessagesAsRead([newMessage.id]);
              }, 1000);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `client_conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Real-time message update received:', payload);
          const updatedMessage = payload.new as Message;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, courseContext?.course_title, userType]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, courseContext?.course_title, userType]);

  // Get read receipt status for a message
  const getReadStatus = (message: Message) => {
    if (message.sender_id === userId) {
      return {
        isDelivered: true,
        isRead: message.read_at !== null,
        readBy: message.read_by || []
      };
    }
    return { isDelivered: true, isRead: true, readBy: [] };
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    getReadStatus
  };
};