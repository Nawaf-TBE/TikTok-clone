import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export const useVideoFetching = () => {
  const { toast } = useToast();

  const fetchWithRetry = async (fetchFn: () => Promise<any>, retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const result = await fetchFn();
        return result;
      } catch (error) {
        lastError = error;
        console.error(`Fetch attempt ${i + 1} failed:`, error);
        
        // Only show toast on final retry
        if (i === retries - 1) {
          toast({
            title: "Error loading videos",
            description: "Please check your connection and try again",
            variant: "destructive",
          });
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    throw lastError;
  };

  const fetchVideosByIds = async (videoIds: string[]) => {
    if (!videoIds?.length) return [];
    
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .in('id', videoIds)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error fetching videos by ids:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Error in fetchVideos:', error);
        throw error;
      }
    };

    try {
      return await fetchWithRetry(fetchVideos);
    } catch (error) {
      console.error('All retries failed fetching videos by ids:', error);
      return [];
    }
  };

  const fetchRecentVideos = async () => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10); // Add limit to reduce data load

        if (error) {
          console.error('Supabase error fetching recent videos:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Error in fetchRecentVideos:', error);
        throw error;
      }
    };

    try {
      return await fetchWithRetry(fetchVideos);
    } catch (error) {
      console.error('All retries failed fetching recent videos:', error);
      return [];
    }
  };

  return { fetchVideosByIds, fetchRecentVideos };
};