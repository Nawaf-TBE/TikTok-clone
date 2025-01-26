import { useState, useRef, RefObject } from 'react';

export const useVideoPlayback = (inView: boolean) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pause();
          setIsPlaying(false);
        } else {
          // Ensure video is muted before first play
          if (!videoRef.current.played.length) {
            videoRef.current.muted = true;
            setIsMuted(true);
          }
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error toggling video playback:", error);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  return {
    videoRef,
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    togglePlay,
    toggleMute,
  };
};
