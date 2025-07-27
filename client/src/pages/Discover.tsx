import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sliders, Heart, X, Star } from "lucide-react";
import SwipeCard from "@/components/SwipeCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DiscoverProps {
  onMatch: (matchData: any) => void;
}

export default function Discover({ onMatch }: DiscoverProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["/api/discover"],
    refetchOnWindowFocus: false,
  }) as { data: any[], isLoading: boolean };

  const swipeMutation = useMutation({
    mutationFn: async ({ swipedId, action }: { swipedId: string; action: string }) => {
      const response = await apiRequest("POST", "/api/swipe", { swipedId, action });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.isMatch) {
        const currentProfile = profiles[currentIndex];
        onMatch({
          profile: currentProfile,
          isMatch: true,
        });
      }
      
      // Move to next card
      setCurrentIndex(prev => prev + 1);
      
      // Refetch profiles if we're running low
      if (currentIndex >= profiles.length - 2) {
        queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
        setCurrentIndex(0);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process swipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (action: 'like' | 'pass') => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      swipeMutation.mutate({
        swipedId: currentProfile.userId,
        action,
      });
    }
  };

  const handleCardSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction === 'right' ? 'like' : 'pass');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🇳🇵</div>
          <div className="text-xl font-semibold text-gray-900">Loading profiles...</div>
        </div>
      </div>
    );
  }

  if (!profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50 pb-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🇳🇵</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profiles Available</h2>
          <p className="text-gray-600 mb-4">Invite friends to join and find your perfect match!</p>
          <Button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
              setCurrentIndex(0);
            }}
            className="bg-nepal-red text-white hover:bg-red-700"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50 pb-20">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-nepal-red">🇳🇵</h1>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Discover</h1>
              <p className="text-sm text-gray-600">Find your perfect match</p>
            </div>
          </div>

        </div>
      </div>
      
      <div className="relative px-4 py-6">
        {/* Swipe Cards Stack */}
        <div className="relative h-96 max-w-sm mx-auto">
          {/* Background cards */}
          {profiles.slice(currentIndex + 1, currentIndex + 3).map((_: any, index: number) => (
            <div 
              key={`bg-${index}`}
              className={`absolute inset-0 bg-white rounded-3xl shadow-lg transform ${
                index === 0 ? 'scale-95 opacity-75' : 'scale-90 opacity-50'
              }`}
            />
          ))}
          
          {/* Active card */}
          {currentProfile && (
            <SwipeCard
              profile={currentProfile}
              onSwipe={handleCardSwipe}
              isActive={true}
            />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-8">
          <Button
            onClick={() => handleSwipe('pass')}
            disabled={swipeMutation.isPending}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:bg-gray-50"
          >
            <X className="h-8 w-8 text-gray-500" />
          </Button>
          
          <Button
            disabled={swipeMutation.isPending}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:bg-gray-50"
          >
            <Star className="h-8 w-8 text-blue-500" />
          </Button>
          
          <Button
            onClick={() => handleSwipe('like')}
            disabled={swipeMutation.isPending}
            className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:bg-gray-50"
          >
            <Heart className="h-8 w-8 text-nepal-red" />
          </Button>
        </div>
      </div>
    </div>
  );
}
