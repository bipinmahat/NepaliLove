import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import React from "react";

const preferencesSchema = z.object({
  minAge: z.number().min(18, "Minimum age must be at least 18").max(100),
  maxAge: z.number().min(18, "Maximum age must be at least 18").max(100),
  preferredGender: z.string().optional(),
  preferredReligion: z.string().optional(),
  maxDistance: z.number().min(1, "Distance must be at least 1 km").max(500),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences"],
    enabled: isOpen,
  });

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      minAge: 18,
      maxAge: 35,
      preferredGender: "",
      preferredReligion: "",
      maxDistance: 50,
    },
  });

  // Update form values when preferences are loaded
  React.useEffect(() => {
    if (preferences) {
      form.reset({
        minAge: (preferences as any).minAge || 18,
        maxAge: (preferences as any).maxAge || 35,
        preferredGender: (preferences as any).preferredGender || "",
        preferredReligion: (preferences as any).preferredReligion || "",
        maxDistance: (preferences as any).maxDistance || 50,
      });
    }
  }, [preferences, form]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      const response = await apiRequest("POST", "/api/preferences", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated!",
        description: "Your dating preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PreferencesFormData) => {
    if (data.minAge >= data.maxAge) {
      toast({
        title: "Invalid Age Range",
        description: "Maximum age must be greater than minimum age.",
        variant: "destructive",
      });
      return;
    }
    updatePreferencesMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Dating Preferences
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Age</FormLabel>
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
                name="maxAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Age</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="preferredGender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredReligion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Religion</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any religion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any religion</SelectItem>
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

            <FormField
              control={form.control}
              name="maxDistance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Distance (km)</FormLabel>
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
                disabled={updatePreferencesMutation.isPending}
                className="flex-1 bg-nepal-red text-white hover:bg-red-700"
              >
                {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}