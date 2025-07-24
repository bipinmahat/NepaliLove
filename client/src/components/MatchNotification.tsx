import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface MatchNotificationProps {
  match: any;
  onClose: () => void;
  onMessage: () => void;
}

export default function MatchNotification({ match, onClose, onMessage }: MatchNotificationProps) {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-nepal-red to-nepal-pink rounded-3xl p-8 text-center text-white max-w-md w-full mx-4 animate-slide-up shadow-2xl">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold mb-3">It's a Match!</h2>
        <p className="text-lg mb-8 opacity-90">
          You and <span className="font-semibold">{match.profile?.name} 🇳🇵</span> both liked each other
        </p>
        
        <div className="flex items-center justify-center space-x-6 mb-8">
          <div className="text-center">
            <img 
              src={(profile as any)?.photos?.[0] || (user as any)?.profileImageUrl || '/api/placeholder/80/80'} 
              alt="Your profile"
              className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
            />
            <p className="text-sm mt-2 font-medium">You</p>
          </div>
          <div className="text-4xl animate-pulse">💕</div>
          <div className="text-center">
            <img 
              src={(match.profile as any)?.photos?.[0] || '/api/placeholder/80/80'} 
              alt="Match profile"
              className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
            />
            <p className="text-sm mt-2 font-medium">{match.profile?.name}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onMessage}
            className="w-full bg-white text-nepal-red px-6 py-3 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg"
          >
            Send Message
          </Button>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-white/80 hover:text-white hover:bg-white/10 py-2 rounded-xl transition-all duration-200"
          >
            Continue Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
