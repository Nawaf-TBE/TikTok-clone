import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useVideoRecommendations } from "./useVideoRecommendations";
import { useVideoFetching } from "./useVideoFetching";
import { useToast } from "./use-toast";

export const useVideoFeed = (user: User | null) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { recommendations, loading: recommendationsLoading } = useVideoRecommendations(user?.id);
  const { fetchVideosByIds, fetchRecentVideos } = useVideoFetching();
  const { toast } = useToast();

  const loadVideos = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('📱 No user logged in - showing general feed');
        const recentVideos = await fetchRecentVideos();
        setVideos(recentVideos);
        return;
      }

      if (recommendations.length > 0) {
        console.log('🎯 Personalized Recommendations:', recommendations.length, 'videos');
        console.table(recommendations.map(rec => ({
          video_id: rec.video_id,
          score: rec.score.toFixed(2)
        })));

        const videoIds = recommendations.map(rec => rec.video_id);
        const recommendedVideos = await fetchVideosByIds(videoIds);
        
        // Sort videos based on recommendation scores and add scores to video objects
        const sortedVideos = recommendedVideos.map(video => {
          const recommendation = recommendations.find(r => r.video_id === video.id);
          return {
            ...video,
            _score: recommendation?.score || 0
          };
        }).sort((a, b) => (b._score || 0) - (a._score || 0));

        console.log('🔄 Final recommended videos order:', 
          sortedVideos.map(v => ({
            title: v.title,
            score: v._score?.toFixed(2)
          }))
        );

        // Only show toast on initial load
        if (!initialLoadComplete) {
          toast({
            title: "Personalized Feed",
            description: `Showing ${sortedVideos.length} videos based on your interests and interactions`,
          });
          setInitialLoadComplete(true);
        }

        setVideos(sortedVideos);
      } else {
        console.log('⚠️ No recommendations available - falling back to recent videos');
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
  }, [user?.id, recommendations, fetchVideosByIds, fetchRecentVideos, toast, initialLoadComplete]);

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
