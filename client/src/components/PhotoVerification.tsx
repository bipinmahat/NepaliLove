import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (verificationPhoto: File) => void;
  profilePhoto: string;
}

export default function PhotoVerification({ 
  isOpen, 
  onClose, 
  onVerificationComplete, 
  profilePhoto 
}: PhotoVerificationProps) {
  const [step, setStep] = useState<'instructions' | 'camera' | 'review'>('instructions');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setStep('camera');
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        
        // Convert to file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'verification.jpg', { type: 'image/jpeg' });
            setVerificationFile(file);
          }
        }, 'image/jpeg', 0.8);
        
        setStep('review');
        stopCamera();
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleRetake = () => {
    setCapturedPhoto(null);
    setVerificationFile(null);
    startCamera();
  };

  const handleSubmit = () => {
    if (verificationFile) {
      onVerificationComplete(verificationFile);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setStep('instructions');
    setCapturedPhoto(null);
    setVerificationFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Photo Verification</DialogTitle>
        </DialogHeader>

        {step === 'instructions' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                To verify your identity, take a photo that matches your profile picture. 
                This helps keep our community safe and authentic.
              </p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Look directly at the camera</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Ensure good lighting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Match your profile photo pose</span>
              </div>
            </div>

            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Verification
            </Button>
          </div>
        )}

        {step === 'camera' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 border-2 border-nepal-red border-dashed rounded-lg pointer-events-none" />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && capturedPhoto && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <img 
                  src={capturedPhoto} 
                  alt="Verification" 
                  className="w-full rounded-lg"
                />
              </CardContent>
            </Card>
            
            <p className="text-sm text-center text-muted-foreground">
              Does this photo clearly show your face and match your profile?
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetake} className="flex-1">
                Retake
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}