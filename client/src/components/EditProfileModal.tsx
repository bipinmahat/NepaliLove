import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(18, "Must be at least 18 years old").max(100, "Must be under 100 years old"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  location: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  lookingFor: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export default function EditProfileModal({ isOpen, onClose, profile }: EditProfileModalProps) {
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize existing photos when profile loads
  React.useEffect(() => {
    if (profile?.photos) {
      setExistingPhotos(profile.photos);
    }
  }, [profile]);

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      age: profile?.age || 18,
      bio: profile?.bio || "",
      location: profile?.location || "",
      ethnicity: profile?.ethnicity || "",
      religion: profile?.religion || "",
      lookingFor: profile?.lookingFor || "",
    },
  });

  // Reset form when profile changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        age: profile.age || 18,
        bio: profile.bio || "",
        location: profile.location || "",
        ethnicity: profile.ethnicity || "",
        religion: profile.religion || "",
        lookingFor: profile.lookingFor || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileFormData) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add existing photos that weren't removed
      const keepPhotos = existingPhotos.filter(photo => !removedPhotos.includes(photo));
      formData.append('existingPhotos', JSON.stringify(keepPhotos));
      
      // Add new photos
      newPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });
      
      // Add video if present
      if (videoFile) {
        formData.append('video', videoFile);
      }
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setNewPhotos([]);
      setVideoFile(null);
      setRemovedPhotos([]);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = existingPhotos.length - removedPhotos.length + newPhotos.length + files.length;
    
    if (totalPhotos > 6) {
      toast({
        title: "Too many photos",
        description: "You can have maximum 6 photos including 1 video.",
        variant: "destructive",
      });
      return;
    }
    
    setNewPhotos([...newPhotos, ...files]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const removeExistingPhoto = (photoUrl: string) => {
    setRemovedPhotos([...removedPhotos, photoUrl]);
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EditProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Photo Management */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Photos & Video (Max 6 total)</label>
              
              {/* Current Photos Grid */}
              <div className="grid grid-cols-3 gap-2">
                {/* Existing Photos */}
                {existingPhotos.filter(photo => !removedPhotos.includes(photo)).map((photoUrl, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square">
                    <img 
                      src={photoUrl} 
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photoUrl)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* New Photos */}
                {newPhotos.map((photo, index) => (
                  <div key={`new-${index}`} className="relative aspect-square">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`New ${index + 1}`}
                      className="w-full h-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(index)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1 rounded">
                      NEW
                    </div>
                  </div>
                ))}

                {/* Video Preview */}
                {(profile?.videoUrl || videoFile) && (
                  <div className="relative aspect-square">
                    <video 
                      src={videoFile ? URL.createObjectURL(videoFile) : profile?.videoUrl}
                      className="w-full h-full rounded-lg object-cover"
                      controls={false}
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                      <div className="text-white text-lg">▶</div>
                    </div>
                    {videoFile && (
                      <button
                        type="button"
                        onClick={() => setVideoFile(null)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                    <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-1 rounded">
                      VIDEO
                    </div>
                  </div>
                )}
                
                {/* Add Photo Button */}
                {(existingPhotos.length - removedPhotos.length + newPhotos.length + (videoFile || profile?.videoUrl ? 1 : 0)) < 6 && (
                  <label className="cursor-pointer aspect-square">
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-nepal-red transition-colors">
                      <Camera className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Add Video Button */}
                {!videoFile && !profile?.videoUrl && (existingPhotos.length - removedPhotos.length + newPhotos.length) < 6 && (
                  <label className="cursor-pointer aspect-square">
                    <div className="w-full h-full border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-500 transition-colors">
                      <div className="text-2xl text-purple-400 mb-1">▶</div>
                      <span className="text-xs text-purple-600">Add Video</span>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Total: {existingPhotos.length - removedPhotos.length + newPhotos.length + (videoFile || profile?.videoUrl ? 1 : 0)}/6
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kathmandu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ethnicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="brahmin">Brahmin</SelectItem>
                        <SelectItem value="chhetri">Chhetri</SelectItem>
                        <SelectItem value="newar">Newar</SelectItem>
                        <SelectItem value="gurung">Gurung</SelectItem>
                        <SelectItem value="magar">Magar</SelectItem>
                        <SelectItem value="tharu">Tharu</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hindu">Hindu</SelectItem>
                        <SelectItem value="buddhist">Buddhist</SelectItem>
                        <SelectItem value="christian">Christian</SelectItem>
                        <SelectItem value="muslim">Muslim</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lookingFor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Looking For</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="serious">Serious Relationship</SelectItem>
                      <SelectItem value="marriage">Marriage</SelectItem>
                      <SelectItem value="friendship">Friendship</SelectItem>
                      <SelectItem value="casual">Casual Dating</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself..." 
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="flex-1 bg-nepal-red text-white hover:bg-red-700"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}