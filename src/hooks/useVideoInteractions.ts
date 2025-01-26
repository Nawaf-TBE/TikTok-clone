import { useLikes } from "./useLikes";
import { useComments } from "./useComments";
import { useShare } from "./useShare";

export const useVideoInteractions = (videoId: string) => {
  const { likes, hasLiked, handleLike } = useLikes(videoId);
  const { comments, isDialogOpen, setIsDialogOpen, handleComment } = useComments(videoId);
  const { handleShare } = useShare();

  return {
    likes,
    comments,
    hasLiked,
    isDialogOpen,
    setIsDialogOpen,
    handleLike,
    handleComment,
    handleShare,
  };
};