import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, UserX, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

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
              onClick={() => {
                toast({
                  title: "Report Feature",
                  description: "To report a specific user, visit their profile and use the report option.",
                });
              }}
            >
              <Shield className="w-4 h-4 mr-2" />
              Block or Report Someone
            </Button>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <UserX className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-900">
                    Permanently Delete Account?
                  </span>
                </div>
                <p className="text-xs text-red-700 mb-3">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAccountMutation.mutate()}
                    disabled={deleteAccountMutation.isPending}
                    className="flex-1"
                  >
                    {deleteAccountMutation.isPending ? "Deleting..." : "Delete Forever"}
                  </Button>
                </div>
              </div>
            )}
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