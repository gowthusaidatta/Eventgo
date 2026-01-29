import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';

interface MediaUploadProps {
  type: 'image' | 'video';
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  folder?: string;
}

export function MediaUpload({ type, currentUrl, onUpload, onRemove, folder = 'uploads' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const acceptTypes = type === 'image' 
    ? 'image/jpeg,image/png,image/webp,image/gif' 
    : 'video/mp4,video/webm,video/ogg';

  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB for images, 100MB for videos

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Maximum size is ${type === 'image' ? '5MB' : '100MB'}`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive'
      });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    onUpload(publicUrl);
    setUploading(false);
    toast({ title: 'Success', description: `${type === 'image' ? 'Image' : 'Video'} uploaded successfully` });
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {type === 'image' ? <Image className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        {type === 'image' ? 'Banner Image' : 'Video'}
      </Label>
      
      {currentUrl ? (
        <div className="relative">
          {type === 'image' ? (
            <img 
              src={currentUrl} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded-md border"
            />
          ) : (
            <video 
              src={currentUrl} 
              className="w-full h-32 object-cover rounded-md border"
              controls
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-md p-4">
          <Input
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`${type}-upload`}
          />
          <label 
            htmlFor={`${type}-upload`}
            className="flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-sm">Click to upload {type}</span>
                <span className="text-xs">Max {type === 'image' ? '5MB' : '100MB'}</span>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
