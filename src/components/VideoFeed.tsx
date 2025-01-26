import { useState, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoUpload } from "./VideoUpload";
import { VideoFeedSkeleton } from "./VideoFeedSkeleton";
import { VideoFeedEmpty } from "./VideoFeedEmpty";
import { PreferencesDialog } from "./PreferencesDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

export const VideoFeed = () => {
  const { user } = useAuth();
  const { videos, loading } = useVideoFeed(user);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const checkUserPreferences = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setShowPreferences(true);
      }
    };

    checkUserPreferences();
  }, [user]);

  if (loading) {
    return <VideoFeedSkeleton />;
  }

  return (
    <div className="h-screen w-full">
      <div className="flex items-center justify-between p-4">
        <VideoUpload />
        <Button
          variant="outline"
          onClick={() => setShowPreferences(true)}
        >
          Update Preferences
        </Button>
      </div>
      <div className="h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoPlayer key={video.id} {...video} />
          ))
        ) : (
          <VideoFeedEmpty />
        )}
      </div>
      <PreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </div>
  );
};