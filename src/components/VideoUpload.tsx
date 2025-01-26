import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileInput } from "./FileInput";
import { useVideoFileUpload } from "@/hooks/useVideoFileUpload";

export const VideoUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uploading, uploadVideo } = useVideoFileUpload(user?.id);

  const handleFileSelect = (file: File) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    uploadVideo(file);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <FileInput
        onFileSelect={handleFileSelect}
        uploading={uploading}
        disabled={!user}
      />
    </div>
  );
};