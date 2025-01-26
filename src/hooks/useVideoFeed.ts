import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useVideoRecommendations } from "./useVideoRecommendations";
import { useVideoFetching } from "./useVideoFetching";

export const useVideoFeed = (user: User | null) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { recommendations, loading: recommendationsLoading } = useVideoRecommendations(user?.id);
  const { fetchVideosByIds, fetchRecentVideos } = useVideoFetching();

  const loadVideos = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available, fetching general feed');
        const recentVideos = await fetchRecentVideos();
        setVideos(recentVideos);
        return;
      }

      if (recommendations.length > 0) {
        const videoIds = recommendations.map(rec => rec.video_id);
        const recommendedVideos = await fetchVideosByIds(videoIds);
        
        // Sort videos based on recommendation scores
        const sortedVideos = recommendedVideos.sort((a, b) => {
          const scoreA = recommendations.find(r => r.video_id === a.id)?.score || 0;
          const scoreB = recommendations.find(r => r.video_id === b.id)?.score || 0;
          return scoreB - scoreA;
        });

        console.log('Final recommended and sorted videos:', sortedVideos?.length);
        setVideos(sortedVideos);
      } else {
        // Fallback to recent videos if no recommendations
        console.log('No recommendations available, falling back to recent videos');
        const recentVideos = await fetchRecentVideos();
        setVideos(recentVideos);
      }
    } catch (error) {
      console.error('Error in video feed:', error);
      const fallbackVideos = await fetchRecentVideos();
      setVideos(fallbackVideos);
    } finally {
      setLoading(false);
    }
  }, [user?.id, recommendations, fetchVideosByIds, fetchRecentVideos]);

  useEffect(() => {
    if (!recommendationsLoading) {
      loadVideos();
    }
  }, [recommendationsLoading, loadVideos]);

  useEffect(() => {
    // Subscribe to changes
    const channel = supabase
      .channel('videos_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        loadVideos();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadVideos]);

  return { videos, loading: loading || recommendationsLoading };
};