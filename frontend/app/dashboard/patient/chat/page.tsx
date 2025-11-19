'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { MessageCircle, Send, ArrowLeft, User, Phone, Video, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { io, Socket } from 'socket.io-client';

export default function PatientChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const loadContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);
      
      const [appointmentsRes, prescriptionsRes] = await Promise.all([
        api.get('/appointments/my-appointments').catch(() => ({ data: [] })),
        api.get('/prescriptions/my-prescriptions').catch(() => ({ data: [] })),
      ]);

      const contactsMap = new Map();

      appointmentsRes.data?.forEach((apt: any) => {
        if (apt.doctorId && !contactsMap.has(apt.doctorId._id)) {
          contactsMap.set(apt.doctorId._id, {
            _id: apt.doctorId._id,
            firstName: apt.doctorId.firstName,
            lastName: apt.doctorId.lastName,
            role: 'doctor',
            specialty: apt.doctorId.specialty,
            lastMessage: 'Appointment scheduled',
          });
        }
      });

      prescriptionsRes.data?.forEach((pres: any) => {
        if (pres.doctorId && !contactsMap.has(pres.doctorId._id)) {
          contactsMap.set(pres.doctorId._id, {
            _id: pres.doctorId._id,
            firstName: pres.doctorId.firstName,
            lastName: pres.doctorId.lastName,
            role: 'doctor',
            specialty: pres.doctorId.specialty,
            lastMessage: 'Prescription created',
          });
        }
      });

      setContacts(Array.from(contactsMap.values()));
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      });
    } finally {
      setLoadingContacts(false);
    }
  }, [toast]);

  const loadConversation = useCallback(
    async (contactId: string) => {
      try {
        const res = await api.get('/chat/conversation', {
          params: { userId: contactId },
        });
        setMessages(res.data || []);
      } catch (error: any) {
        console.error('Error loading conversation:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversation',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadContacts();

    if (user && false) {
      try {
        const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:3001', {
          auth: {
            token,
          },
          transports: ['websocket'],
        });

        newSocket.on('connect', () => {
          console.log('Connected to chat server');
        });

        newSocket.on('message', (message: any) => {
          setMessages((prev) => [...prev, message]);
        });

        newSocket.on('error', (error: any) => {
          console.error('Socket error:', error);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Failed to connect to socket:', error);
      }
    }
  }, [user, loadContacts]);

  useEffect(() => {
    const normalizedRole = user?.role?.toUpperCase() || '';
    if (!loading && normalizedRole !== 'PATIENT') {
      router.push('/login');
    }
  }, [user, loading, router]);

  

  useEffect(() => {
    const userId = searchParams.get('userId') || searchParams.get('doctorId');
    const emergency = searchParams.get('emergency') === 'true';
    const video = searchParams.get('video') === 'true';

    if (contacts.length > 0) {
      if (userId) {
        const contact = contacts.find((c: any) => c._id === userId);
        if (contact) setSelectedContact(contact);
      } else if (emergency || video) {
        const doctor = contacts.find((c: any) => (c.role || '').toUpperCase() === 'DOCTOR') || contacts[0];
        if (doctor) {
          setSelectedContact(doctor);
          const quickMsg =
            emergency
              ? 'Emergency support requested. Please respond as soon as possible.'
              : 'Teleconsultation requested. Please start a video call when available.';
          api
            .post('/chat/message', { receiverId: doctor._id, message: quickMsg })
            .then(() => loadConversation(doctor._id))
            .catch(() => {});
        }
      }
    }
  }, [searchParams, contacts, loadConversation]);

  useEffect(() => {
    if (selectedContact) {
      loadConversation(selectedContact._id);
    }
  }, [selectedContact, loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const messageData = {
        receiverId: selectedContact._id,
        message: newMessage.trim(),
      };

      // Send via API
      const res = await api.post('/chat/message', messageData);

      // Add to local state immediately for better UX
      const message = {
        _id: res.data._id || Date.now().toString(),
        senderId: user?.id,
        receiverId: selectedContact._id,
        message: newMessage.trim(),
        createdAt: new Date(),
        isRead: false,
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage('');

      // Send via socket if connected (optional)
      if (socket && socket.connected) {
        socket.emit('message', message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const getContactDisplayName = (contact: any) => {
    if ((contact.role || '').toUpperCase() === 'DOCTOR') {
      return `Dr. ${contact.firstName} ${contact.lastName}`;
    }
    return `${contact.firstName} ${contact.lastName}`.trim() || contact.role;
  };

  if (loading || loadingContacts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-200px)]">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/patient')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.length > 0 ? (
              <div className="space-y-1 p-2">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedContact?._id === contact._id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {getContactDisplayName(contact)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.specialty || contact.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No contacts available</p>
                <p className="text-xs mt-1">
                  Start a conversation after booking an appointment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{getContactDisplayName(selectedContact)}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact.specialty || selectedContact.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedContact) return;
                      api
                        .post('/chat/message', {
                          receiverId: selectedContact._id,
                          message: 'Please call me when available.',
                        })
                        .then(() => loadConversation(selectedContact._id))
                        .catch(() => {});
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedContact) return;
                      api
                        .post('/chat/message', {
                          receiverId: selectedContact._id,
                          message: 'Teleconsultation (video) requested.',
                        })
                        .then(() => loadConversation(selectedContact._id))
                        .catch(() => {});
                    }}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length > 0 ? (
                  messages.map((message: any) => {
                    const isOwn = message.senderId === user?.id || message.senderId?._id === user?.id;
                    return (
                      <div
                        key={message._id || message.createdAt}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white border'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">
                  Select a contact to start chatting
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose a doctor, optometrist, or pharmacist from the sidebar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
