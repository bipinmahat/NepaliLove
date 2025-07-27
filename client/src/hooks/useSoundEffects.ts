import { useRef, useCallback } from 'react';

export function useSoundEffects() {
  const audioContext = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext.current;
  }, []);

  const playSwipeSound = useCallback((type: 'like' | 'pass') => {
    try {
      const context = initAudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      if (type === 'like') {
        // Pleasant chime sound for likes
        oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
      } else {
        // Lower dismissive sound for pass
        oscillator.frequency.setValueAtTime(220, context.currentTime); // A3
        oscillator.frequency.setValueAtTime(196, context.currentTime + 0.1); // G3
      }

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      // Silent fail if audio not supported
      console.log('Audio not supported');
    }
  }, [initAudioContext]);

  const playMatchSound = useCallback(() => {
    try {
      const context = initAudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Celebratory match sound
      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.5, context.currentTime + 0.3); // C6

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.15, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [initAudioContext]);

  return {
    playSwipeSound,
    playMatchSound,
  };
}