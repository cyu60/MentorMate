import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FileUploadFieldProps {
  name: string;
  label: string;
  description: string;
  accept?: string;
  onChange: (files: FileList | undefined) => void;
  onBlur: () => void;
  ref: React.Ref<HTMLInputElement>;
}

export function FileUploadField({
  name,
  label,
  description,
  accept,
  onChange,
  onBlur,
  ref,
}: FileUploadFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      onChange(files);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onChange(undefined);
    const fileInput = document.querySelector(
      `input[name="${name}"]`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <FormItem>
      <FormLabel className="text-base">{label}</FormLabel>
      <FormControl>
        <div className="flex items-center gap-3">
          <input
            type="file"
            name={name}
            ref={ref}
            onBlur={onBlur}
            onChange={handleFileChange}
            accept={accept}
            className="flex-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {selectedFile && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="px-2 py-1"
            >
              Remove
            </Button>
          )}
        </div>
      </FormControl>
      <FormDescription className="text-sm">{description}</FormDescription>
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </p>
      )}
      <FormMessage className="text-sm" />
    </FormItem>
  );
}