import { Heart, MessageCircle, Share2, VolumeX, Volume2 } from "lucide-react";

interface VideoControlsProps {
  likes: number;
  comments: number;
  hasLiked: boolean;
  isMuted: boolean;
  onLike: (e: React.MouseEvent) => void;
  onMute: (e: React.MouseEvent) => void;
  onComment: () => void;
  onShare: () => void;
}

export const VideoControls = ({
  likes,
  comments,
  hasLiked,
  isMuted,
  onLike,
  onMute,
  onComment,
  onShare,
}: VideoControlsProps) => {
  return (
    <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
      <button
        className={`flex flex-col items-center gap-1 ${hasLiked ? 'text-tiktok-pink' : 'text-white'}`}
        onClick={onLike}
      >
        <Heart className={`w-8 h-8 ${hasLiked ? 'fill-tiktok-pink' : ''}`} />
        <span className="text-xs">{hasLiked ? likes + 1 : likes}</span>
      </button>

      <button 
        className="flex flex-col items-center gap-1 text-white"
        onClick={onComment}
      >
        <MessageCircle className="w-8 h-8" />
        <span className="text-xs">{comments}</span>
      </button>

      <button 
        className="flex flex-col items-center gap-1 text-white"
        onClick={onShare}
      >
        <Share2 className="w-8 h-8" />
        <span className="text-xs">Share</span>
      </button>

      <button className="text-white p-2" onClick={onMute}>
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>
    </div>
  );
};