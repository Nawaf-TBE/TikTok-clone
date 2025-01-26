import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useComments = (videoId: string) => {
  const [comments, setComments] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact' })
          .eq('video_id', videoId);

        setComments(count || 0);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    // Subscribe to changes
    const channel = supabase
      .channel('comments_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `video_id=eq.${videoId}` },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [videoId]);

  const handleComment = () => {
    setIsDialogOpen(true);
  };

  return {
    comments,
    isDialogOpen,
    setIsDialogOpen,
    handleComment
  };
};