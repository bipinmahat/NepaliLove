import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    matchNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
    promotionalEmails: false,
    soundEnabled: true,
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
    onClose();
  };

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-sm">
                Enable push notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(value) => updateSetting('pushNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="match-notifications" className="text-sm">
                New matches
              </Label>
              <Switch
                id="match-notifications"
                checked={settings.matchNotifications}
                onCheckedChange={(value) => updateSetting('matchNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="message-notifications" className="text-sm">
                New messages
              </Label>
              <Switch
                id="message-notifications"
                checked={settings.messageNotifications}
                onCheckedChange={(value) => updateSetting('messageNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="like-notifications" className="text-sm">
                Someone likes you
              </Label>
              <Switch
                id="like-notifications"
                checked={settings.likeNotifications}
                onCheckedChange={(value) => updateSetting('likeNotifications', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-sm">
                Important updates
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(value) => updateSetting('emailNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promotional-emails" className="text-sm">
                Promotional emails
              </Label>
              <Switch
                id="promotional-emails"
                checked={settings.promotionalEmails}
                onCheckedChange={(value) => updateSetting('promotionalEmails', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Sound</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="text-sm">
                Notification sounds
              </Label>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={(value) => updateSetting('soundEnabled', value)}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-nepal-red text-white hover:bg-red-700"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}