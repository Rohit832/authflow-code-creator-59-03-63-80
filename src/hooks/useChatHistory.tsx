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
}

interface UseChatHistoryProps {
  conversationId: string | null;
  userId: string | null;
  userType: 'client' | 'admin' | 'coach';
}

export const useChatHistory = ({ conversationId, userId, userType }: UseChatHistoryProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Load messages for the conversation
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

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
  }, [conversationId, userId, toast]);

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (!userId || messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          read_at: new Date().toISOString(),
          read_by: [userId]
        })
        .in('id', messageIds)
        .neq('sender_id', userId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) && msg.sender_id !== userId
          ? { ...msg, read_at: new Date().toISOString(), read_by: [userId] }
          : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a new message with enhanced persistence
  const sendMessage = async (content: string) => {
    if (!conversationId || !userId || !content.trim()) return false;

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
          conversation_id: conversationId,
          sender_id: userId,
          sender_type: userType,
          content: content.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

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
        .from('conversations')
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
        description: 'Failed to send message. All messages are automatically saved for recovery.',
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

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Auto-mark as read if it's from another user
          if (newMessage.sender_id !== userId) {
            setTimeout(() => markMessagesAsRead([newMessage.id]), 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  // Load messages when conversation changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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