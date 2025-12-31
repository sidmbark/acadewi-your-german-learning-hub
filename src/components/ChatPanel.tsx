import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, X, Loader2, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Profile {
  id: string;
  nom: string;
  prenom: string;
}

interface Conversation {
  id: string;
  etudiant_id: string;
  professeur_id: string;
  updated_at: string;
  otherUser?: Profile;
  unreadCount?: number;
  lastMessage?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  lu: boolean;
  created_at: string;
}

interface ChatPanelProps {
  userId: string;
  userRole: 'etudiant' | 'professeur';
  professors?: Profile[]; // For students to start new conversations
}

export function ChatPanel({ userId, userRole, professors = [] }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);

      // Subscribe to new messages
      const channel = supabase
        .channel(`messages-${selectedConversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${selectedConversation.id}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages(prev => [...prev, newMsg]);
            if (newMsg.sender_id !== userId) {
              markMessagesAsRead(selectedConversation.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: convs, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`etudiant_id.eq.${userId},professeur_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch other user profiles and last messages
      const enrichedConvs = await Promise.all(
        (convs || []).map(async (conv) => {
          const otherUserId = conv.etudiant_id === userId ? conv.professeur_id : conv.etudiant_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, nom, prenom')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('lu', false)
            .neq('sender_id', userId);

          return {
            ...conv,
            otherUser: profile,
            lastMessage: lastMsg?.content,
            unreadCount: count || 0,
          };
        })
      );

      setConversations(enrichedConvs);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    await supabase
      .from('chat_messages')
      .update({ lu: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  };

  const startConversation = async (professeurId: string) => {
    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('etudiant_id', userId)
        .eq('professeur_id', professeurId)
        .single();

      if (existing) {
        const prof = professors.find(p => p.id === professeurId);
        setSelectedConversation({ ...existing, otherUser: prof });
      } else {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            etudiant_id: userId,
            professeur_id: professeurId,
          })
          .select()
          .single();

        if (error) throw error;

        const prof = professors.find(p => p.id === professeurId);
        setSelectedConversation({ ...newConv, otherUser: prof });
        fetchConversations();
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer la conversation',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: userId,
          content: newMessage.trim(),
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-destructive">
            {totalUnread}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          {selectedConversation ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-base">
                  {selectedConversation.otherUser?.prenom} {selectedConversation.otherUser?.nom}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {userRole === 'etudiant' ? 'Professeur' : 'Étudiant'}
                </p>
              </div>
            </div>
          ) : (
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {!selectedConversation ? (
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* New conversation with professors (for students) */}
                {userRole === 'etudiant' && professors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Nouvelle conversation</p>
                    {professors.map(prof => (
                      <div
                        key={prof.id}
                        onClick={() => startConversation(prof.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer border"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {prof.prenom[0]}{prof.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{prof.prenom} {prof.nom}</p>
                          <p className="text-xs text-muted-foreground">Professeur</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing conversations */}
                {conversations.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-2">Conversations</p>
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer border ${
                          conv.unreadCount ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {conv.otherUser?.prenom?.[0]}{conv.otherUser?.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conv.otherUser?.prenom} {conv.otherUser?.nom}
                            </p>
                            {conv.unreadCount ? (
                              <Badge className="bg-primary h-5 w-5 flex items-center justify-center p-0">
                                {conv.unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune conversation
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender_id === userId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_id === userId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
