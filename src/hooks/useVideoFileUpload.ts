import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useVideoFileUpload = (userId: string | undefined) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const uploadVideo = async (file: File) => {
    try {
      setUploading(true);

      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Error",
          description: "Please upload a valid video file",
          variant: "destructive",
        });
        return;
      }

      // Maximum file size (500MB)
      const MAX_FILE_SIZE = 500 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: "File size must be less than 500MB",
          variant: "destructive",
        });
        return;
      }

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Failed to get public URL');

      // Save video metadata to database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title: file.name,
          video_url: publicUrl,
          description: '',
          user_id: userId,
        });

      if (dbError) throw dbError;

      // Trigger video analysis
      const { error: analysisError } = await supabase.functions
        .invoke('analyze-video', {
          body: {
            videoUrl: publicUrl,
            title: file.name,
            description: ''
          }
        });

      if (analysisError) {
        console.error('Error analyzing video:', analysisError);
        // Don't throw here, we still want to show success for the upload
      }

      toast({
        title: "Success",
        description: "Video uploaded and being analyzed!",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadVideo,
  };
};