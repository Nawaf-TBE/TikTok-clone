import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CommentDialogProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentDialog = ({ videoId, isOpen, onClose }: CommentDialogProps) => {
  const [comment, setComment] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          { video_id: videoId, user_id: user.id, content: comment.trim() }
        ]);

      if (error) throw error;
      
      setComment("");
      onClose();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            className="w-full min-h-[100px] p-2 border rounded-md"
            maxLength={500}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!comment.trim()}>
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};