import { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useVideoPlayback } from "@/hooks/useVideoPlayback";
import { VideoInteractions } from "./VideoInteractions";

interface VideoPlayerProps {
  id: string;
  video_url: string;
  title: string;
  user_id: string;
}

export const VideoPlayer = ({ id, video_url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  const {
    isPlaying,
    isMuted,
    togglePlay,
    toggleMute
  } = useVideoPlayback({ videoRef });

  useEffect(() => {
    if (videoRef.current) {
      const playVideo = async () => {
        try {
          if (inView && !isPlaying) {
            await videoRef.current?.play();
          } else {
            videoRef.current?.pause();
          }
        } catch (error) {
          console.error("Playback error:", error);
        }
      };
      
      playVideo();
    }
  }, [inView, isPlaying]);

  return (
    <div className="relative h-screen w-full snap-start bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={(el) => {
            // @ts-ignore - this is fine since we're combining refs
            videoRef.current = el;
            inViewRef(el);
          }}
          src={video_url}
          className="h-full w-full object-contain"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
        />
      </div>
      <VideoInteractions
        videoId={id}
        isMuted={isMuted}
        onMute={toggleMute}
      />
    </div>
  );
};