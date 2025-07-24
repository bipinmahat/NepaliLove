import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MoreVertical, Camera, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ChatProps {
  onOpenChat?: (conversation: any) => void;
}

export default function Chat({ onOpenChat }: ChatProps) {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages", selectedChat?.id],
    enabled: !!selectedChat?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest(`/api/conversations/${selectedChat.id}/messages`, {
        method: "POST",
        body: messageData,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedChat?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    sendMessageMutation.mutate({
      content: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenChat = (conversation: any) => {
    setSelectedChat(conversation);
    if (onOpenChat) {
      onOpenChat(conversation);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  // Chat List View
  if (!selectedChat) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <div className="text-xl font-semibold text-gray-900">Loading conversations...</div>
          </div>
        </div>
      );
    }

    if (!conversations.length) {
      return (
        <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Messages Yet</h2>
            <p className="text-gray-600 mb-4">Start chatting with your matches!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        </div>
        
        <div className="px-4 py-6 space-y-3">
          {conversations.map((conversation: any) => (
            <Card 
              key={conversation.id}
              className="overflow-hidden border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleOpenChat(conversation)}
            >
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 p-4">
                  <div className="relative">
                    <img 
                      src={conversation.profile?.photos?.[0] || '/api/placeholder/56/56'} 
                      alt={conversation.profile?.name || 'Chat'}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.profile?.name} 🇳🇵
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessage 
                          ? formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })
                          : 'New match'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || "Start a conversation!"}
                    </p>
                  </div>
                  {conversation.lastMessage && (
                    <div className="w-2 h-2 bg-nepal-red rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Chat Window View
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={handleCloseChat}>
          <ArrowLeft className="h-5 w-5 text-nepal-red" />
        </Button>
        <div className="flex items-center space-x-3 flex-1">
          <img 
            src={selectedChat.profile?.photos?.[0] || '/api/placeholder/40/40'} 
            alt={selectedChat.profile?.name || 'Chat'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{selectedChat.profile?.name} 🇳🇵</h3>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg: any) => {
          const isMyMessage = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex items-start space-x-2 ${isMyMessage ? 'justify-end' : ''}`}>
              {!isMyMessage && (
                <img 
                  src={selectedChat.profile?.photos?.[0] || '/api/placeholder/32/32'} 
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                isMyMessage 
                  ? 'bg-nepal-red text-white rounded-tr-md' 
                  : 'bg-gray-100 text-gray-900 rounded-tl-md'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMyMessage ? 'text-red-100' : 'text-gray-500'}`}>
                  {isMyMessage ? 'You' : selectedChat.profile?.name} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isMyMessage && (
                <img 
                  src={profile?.photos?.[0] || user?.profileImageUrl || '/api/placeholder/32/32'} 
                  alt="Your profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <Camera className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-gray-100 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-nepal-red focus:bg-white transition-all"
            />
            <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
            className="bg-nepal-red hover:bg-red-600 text-white rounded-full p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}