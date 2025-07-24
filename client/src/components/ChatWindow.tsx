import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Smile, Send, MoreVertical } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface ChatWindowProps {
  chat: any;
  onClose: () => void;
}

export default function ChatWindow({ chat, onClose }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: myProfile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Get or create conversation
  const conversationMutation = useMutation({
    mutationFn: async () => {
      const otherUserId = chat.profile?.userId || (chat.user1Id === chat.userId ? chat.user2Id : chat.user1Id);
      const response = await apiRequest("POST", "/api/conversations", { otherUserId });
      return response.json();
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
  });

  // Get messages
  const { data: messages = [] } = useQuery({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    },
  });

  // WebSocket for real-time messages
  const { sendMessage: sendWsMessage } = useWebSocket((data) => {
    if (data.type === 'new_message' && data.message.conversationId === conversationId) {
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
    }
  });

  useEffect(() => {
    if (!conversationId) {
      conversationMutation.mutate();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && conversationId) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-5 w-5 text-nepal-red" />
        </Button>
        <div className="flex items-center space-x-3 flex-1">
          <img 
            src={chat.profile?.photos?.[0] || '/api/placeholder/40/40'} 
            alt={chat.profile?.name || 'Chat'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{chat.profile?.name} 🇳🇵</h3>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {(messages as any[]).map((msg: any) => {
          const isMyMessage = msg.senderId === (user as any)?.id;
          return (
            <div key={msg.id} className={`flex items-start space-x-2 ${isMyMessage ? 'justify-end' : ''}`}>
              {!isMyMessage && (
                <img 
                  src={chat.profile?.photos?.[0] || '/api/placeholder/32/32'} 
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
                  {isMyMessage ? 'You' : chat.profile?.name} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isMyMessage && (
                <img 
                  src={(myProfile as any)?.photos?.[0] || (user as any)?.profileImageUrl || '/api/placeholder/32/32'} 
                  alt="Your profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
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
            className="bg-nepal-red text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
