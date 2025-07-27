import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";

interface SwipeCardProps {
  profile: any;
  onSwipe: (direction: 'left' | 'right') => void;
  isActive: boolean;
}

export default function SwipeCard({ profile, onSwipe, isActive }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  // Reset card position when profile changes
  useEffect(() => {
    setDragX(0);
    setDragY(0);
    setIsAnimating(false);
    setIsDragging(false);
  }, [profile.id]);

  const handleStart = (clientX: number, clientY: number) => {
    if (!isActive) return;
    setIsDragging(true);
    startX.current = clientX;
    startY.current = clientY;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isActive) return;
    
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    
    setDragX(deltaX);
    setDragY(deltaY);
  };

  const handleEnd = () => {
    if (!isDragging || !isActive) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    
    if (Math.abs(dragX) > threshold) {
      setIsAnimating(true);
      const direction = dragX > 0 ? 'right' : 'left';
      
      // Animate card off screen before calling onSwipe
      const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
      setDragX(exitX);
      
      setTimeout(() => {
        onSwipe(direction);
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back to center
      setDragX(0);
      setDragY(0);
    }
  };

  const rotation = dragX * 0.1;
  const likeOpacity = Math.max(0, Math.min(1, dragX / 150));
  const passOpacity = Math.max(0, Math.min(1, -dragX / 150));

  return (
    <div
      ref={cardRef}
      className={`swipe-card absolute inset-0 bg-white rounded-3xl shadow-2xl cursor-grab ${
        isDragging ? 'dragging' : ''
      } ${isAnimating ? 'transition-transform duration-300' : ''}`}
      style={{
        transform: `translateX(${dragX}px) translateY(${dragY}px) rotate(${rotation}deg)`,
        zIndex: isActive ? 10 : 1,
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      <div className="relative h-full">
        {/* Profile Image */}
        <img 
          src={profile.photos?.[0] || '/api/placeholder/400/300'} 
          alt={profile.name}
          className="w-full h-2/3 object-cover rounded-t-3xl"
        />
        
        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {profile.name} 🇳🇵 <span className="text-lg font-normal text-gray-600">{profile.age}</span>
            </h3>
            {profile.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{profile.location}</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {profile.lookingFor && `Looking for ${profile.lookingFor}`}
            {profile.religion && ` • ${profile.religion}`}
            {profile.ethnicity && ` • ${profile.ethnicity}`}
          </p>
          <p className="text-gray-700 text-sm line-clamp-2">
            {profile.bio || "No bio available"}
          </p>
        </div>
        
        {/* Swipe Overlays */}
        <div 
          className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center transition-opacity"
          style={{ opacity: likeOpacity }}
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg">
            ❤️ LIKE
          </div>
        </div>
        
        <div 
          className="absolute inset-0 bg-gray-500/20 rounded-3xl flex items-center justify-center transition-opacity"
          style={{ opacity: passOpacity }}
        >
          <div className="bg-gray-500 text-white px-6 py-3 rounded-full font-bold text-lg">
            ✖️ PASS
          </div>
        </div>
      </div>
    </div>
  );
}
