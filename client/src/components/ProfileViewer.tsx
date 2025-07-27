import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { X, Heart, Ban, MapPin, Calendar, Users, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProfileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  showActions?: boolean;
}

export default function ProfileViewer({ isOpen, onClose, userId, showActions = false }: ProfileViewerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/profile/${userId}`],
    enabled: isOpen && !!userId,
  });

  const blockUserMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/block", { blockedUserId: userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Blocked",
        description: "You won't see this user again.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const likeUserMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/swipe", { 
        swipedId: userId, 
        action: "like" 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isMatch) {
        toast({
          title: "It's a Match! 💕",
          description: "You both liked each other!",
        });
      } else {
        toast({
          title: "Liked!",
          description: "Your like has been sent.",
        });
      }
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send like. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🇳🇵</div>
              <div className="text-lg">Loading profile...</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-lg">Profile not found</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const photos = (profile as any)?.photos || [];
  const currentPhoto = photos[currentPhotoIndex] || '/api/placeholder/400/600';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Photo Section */}
          <div className="relative h-96 overflow-hidden rounded-t-lg">
            <img 
              src={currentPhoto}
              alt={(profile as any)?.name}
              className="w-full h-full object-cover"
            />
            
            {/* Photo Navigation */}
            {photos.length > 1 && (
              <>
                <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1">
                  {photos.map((_: any, index: number) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 mx-1 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center"
                  disabled={currentPhotoIndex === 0}
                >
                  ←
                </button>
                
                <button
                  onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center"
                  disabled={currentPhotoIndex === photos.length - 1}
                >
                  →
                </button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 p-0 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {(profile as any)?.name} 🇳🇵
              </h2>
              <div className="flex items-center space-x-4 text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{(profile as any)?.age} years old</span>
                </div>
                {(profile as any)?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{(profile as any).location}</span>
                  </div>
                )}
              </div>
            </div>

            {(profile as any)?.bio && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-700">{(profile as any).bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Profile Details */}
            <div className="grid grid-cols-2 gap-4">
              {(profile as any)?.ethnicity && (
                <Card>
                  <CardContent className="p-3 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-nepal-red" />
                    <div className="text-sm font-medium">{(profile as any).ethnicity}</div>
                    <div className="text-xs text-gray-500">Ethnicity</div>
                  </CardContent>
                </Card>
              )}
              
              {(profile as any)?.religion && (
                <Card>
                  <CardContent className="p-3 text-center">
                    <Book className="h-5 w-5 mx-auto mb-1 text-nepal-red" />
                    <div className="text-sm font-medium">{(profile as any).religion}</div>
                    <div className="text-xs text-gray-500">Religion</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {(profile as any)?.lookingFor && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-900 mb-1">Looking for</div>
                  <div className="text-gray-600 capitalize">{(profile as any).lookingFor}</div>
                </CardContent>
              </Card>
            )}

            {/* Video Section */}
            {(profile as any)?.videoUrl && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">Video Introduction</div>
                  <video 
                    controls 
                    className="w-full rounded-lg"
                    src={(profile as any).videoUrl}
                  />
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => blockUserMutation.mutate()}
                  disabled={blockUserMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Block
                </Button>
                
                <Button
                  onClick={() => likeUserMutation.mutate()}
                  disabled={likeUserMutation.isPending}
                  className="flex-1 bg-nepal-red text-white hover:bg-red-700"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}