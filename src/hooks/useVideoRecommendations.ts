import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVideoRecommendations = (userId: string | undefined) => {
  const [recommendations, setRecommendations] = useState<{ video_id: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) return;

      try {
        const { data: recs, error } = await supabase
          .rpc('get_recommended_videos', {
            user_id_input: userId
          });

        if (error) {
          console.error('Error getting recommendations:', error);
          return;
        }

        // Get user preferences
        const { data: userPrefs } = await supabase
          .from('user_preferences')
          .select('interests')
          .eq('user_id', userId)
          .single();

        if (userPrefs?.interests) {
          // Fetch AI analysis for recommended videos
          const { data: videos } = await supabase
            .from('videos')
            .select('id, ai_analysis')
            .in('id', recs.map(r => r.video_id));

          // Adjust scores based on AI analysis matching user preferences
          const adjustedRecs = recs.map(rec => {
            const video = videos?.find(v => v.id === rec.video_id);
            let aiScore = 0;

            if (video?.ai_analysis) {
              try {
                const analysis = video.ai_analysis as {
                  categories?: string[];
                  topics?: string[];
                };
                
                // Check if video categories/topics match user interests
                const matchingInterests = userPrefs.interests.filter((interest: string) =>
                  analysis.categories?.some((category: string) => 
                    category.toLowerCase().includes(interest.toLowerCase())
                  ) ||
                  analysis.topics?.some((topic: string) => 
                    topic.toLowerCase().includes(interest.toLowerCase())
                  )
                );
                aiScore = matchingInterests.length * 0.5; // Adjust weight as needed
              } catch (e) {
                console.error('Error parsing AI analysis:', e);
              }
            }

            return {
              video_id: rec.video_id,
              score: rec.score + aiScore
            };
          });

          console.log('Received recommendations with AI analysis:', adjustedRecs?.length, 'videos');
          setRecommendations(adjustedRecs || []);
        } else {
          console.log('Received recommendations:', recs?.length, 'videos');
          setRecommendations(recs || []);
        }
      } catch (error) {
        console.error('Error in recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  return { recommendations, loading };
};