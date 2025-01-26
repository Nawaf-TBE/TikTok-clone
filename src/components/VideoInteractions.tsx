import { VideoControls } from "./VideoControls";
import { CommentDialog } from "./CommentDialog";
import { useVideoInteractions } from "@/hooks/useVideoInteractions";

interface VideoInteractionsProps {
  videoId: string;
  isMuted: boolean;
  onMute: (e: React.MouseEvent) => void;
}

export const VideoInteractions = ({ videoId, isMuted, onMute }: VideoInteractionsProps) => {
  const {
    likes,
    comments,
    hasLiked,
    isDialogOpen,
    setIsDialogOpen,
    handleLike,
    handleComment,
    handleShare,
  } = useVideoInteractions(videoId);

  return (
    <>
      <VideoControls
        likes={likes}
        comments={comments}
        hasLiked={hasLiked}
        isMuted={isMuted}
        onLike={handleLike}
        onMute={onMute}
        onComment={handleComment}
        onShare={handleShare}
      />
      <CommentDialog 
        videoId={videoId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};