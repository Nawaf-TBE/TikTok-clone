import { useEffect, RefObject } from 'react';

interface UseVideoIntersectionProps {
  videoRef: RefObject<HTMLVideoElement>;
  onIntersect: () => Promise<void>;
  onLeave: () => void;
}

export const useVideoIntersection = ({ 
  videoRef, 
  onIntersect, 
  onLeave 
}: UseVideoIntersectionProps) => {
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          await onIntersect();
        } else {
          onLeave();
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [videoRef, onIntersect, onLeave]);
};