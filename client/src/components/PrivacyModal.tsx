import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const [settings, setSettings] = useState({
    profileVisibility: "everyone",
    showDistance: true,
    showLastSeen: false,
    showActiveStatus: true,
    allowMessages: "matches",
    shareLocation: true,
    showAge: true,
    readReceipts: true,
    blockScreenshots: false,
    incognitoMode: false,
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
    onClose();
  };

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy & Safety</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
            
            <div className="space-y-2">
              <Label className="text-sm">Who can see your profile</Label>
              <Select 
                value={settings.profileVisibility} 
                onValueChange={(value) => updateSetting('profileVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="matches">Only matches</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-distance" className="text-sm">
                Show distance
              </Label>
              <Switch
                id="show-distance"
                checked={settings.showDistance}
                onCheckedChange={(value) => updateSetting('showDistance', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-age" className="text-sm">
                Show age
              </Label>
              <Switch
                id="show-age"
                checked={settings.showAge}
                onCheckedChange={(value) => updateSetting('showAge', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Activity Status</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-active-status" className="text-sm">
                Show when you're active
              </Label>
              <Switch
                id="show-active-status"
                checked={settings.showActiveStatus}
                onCheckedChange={(value) => updateSetting('showActiveStatus', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-last-seen" className="text-sm">
                Show last seen
              </Label>
              <Switch
                id="show-last-seen"
                checked={settings.showLastSeen}
                onCheckedChange={(value) => updateSetting('showLastSeen', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="incognito-mode" className="text-sm">
                Incognito mode
              </Label>
              <Switch
                id="incognito-mode"
                checked={settings.incognitoMode}
                onCheckedChange={(value) => updateSetting('incognitoMode', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Messaging</h3>
            
            <div className="space-y-2">
              <Label className="text-sm">Who can message you</Label>
              <Select 
                value={settings.allowMessages} 
                onValueChange={(value) => updateSetting('allowMessages', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="matches">Only matches</SelectItem>
                  <SelectItem value="none">No one</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="read-receipts" className="text-sm">
                Read receipts
              </Label>
              <Switch
                id="read-receipts"
                checked={settings.readReceipts}
                onCheckedChange={(value) => updateSetting('readReceipts', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Location & Security</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="share-location" className="text-sm">
                Share location for matching
              </Label>
              <Switch
                id="share-location"
                checked={settings.shareLocation}
                onCheckedChange={(value) => updateSetting('shareLocation', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="block-screenshots" className="text-sm">
                Block screenshots
              </Label>
              <Switch
                id="block-screenshots"
                checked={settings.blockScreenshots}
                onCheckedChange={(value) => updateSetting('blockScreenshots', value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              Block or Report Someone
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              Download My Data
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete Account
            </Button>
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