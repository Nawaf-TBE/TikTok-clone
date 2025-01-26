import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLikes = (videoId: string) => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact' })
          .eq('video_id', videoId);

        const { data: userLike } = await supabase
          .from('likes')
          .select()
          .eq('video_id', videoId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();

        setLikes(likesCount || 0);
        setHasLiked(!!userLike);
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    fetchLikes();
  }, [videoId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like videos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (hasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking video:', error);
          toast({
            title: "Error",
            description: "Could not unlike the video",
            variant: "destructive",
          });
          return;
        }

        setHasLiked(false);
        setLikes(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([
            { video_id: videoId, user_id: user.id }
          ]);

        if (error) {
          if (error.code === '23505') {
            const { count: likesCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact' })
              .eq('video_id', videoId);
              
            setLikes(likesCount || 0);
            setHasLiked(true);
            return;
          }
          
          console.error('Error liking video:', error);
          toast({
            title: "Error",
            description: "Could not like the video",
            variant: "destructive",
          });
          return;
        }

        setHasLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    likes,
    hasLiked,
    handleLike
  };
};