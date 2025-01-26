import { useToast } from "@/hooks/use-toast";

export const useShare = () => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Check out this video!",
        url: window.location.href,
      });
    } catch (error) {
      toast({
        title: "Share",
        description: "Sharing is not supported on this device",
      });
    }
  };

  return {
    handleShare
  };
};