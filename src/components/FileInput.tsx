import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FileInputProps {
  onFileSelect: (file: File) => void;
  uploading: boolean;
  disabled?: boolean;
}

export const FileInput = ({ onFileSelect, uploading, disabled }: FileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || disabled}
      />
      <Button
        variant="default"
        className="rounded-full px-6"
        disabled={uploading || disabled}
        onClick={handleButtonClick}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload Video'
        )}
      </Button>
    </>
  );
};