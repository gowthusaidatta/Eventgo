import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ensureAvatarsBucketExists, createAvatarsBucketIfNeeded } from '@/lib/storageSetup';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName?: string;
  onUploadComplete: (avatarUrl: string) => void;
  userId: string;
}

export function AvatarUpload({ currentAvatarUrl, userName = 'U', onUploadComplete, userId }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bucketReady, setBucketReady] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if bucket exists on component mount
    const checkBucket = async () => {
      let exists = await ensureAvatarsBucketExists();
      
      // If bucket doesn't exist, try to create it
      if (!exists) {
        console.log('Bucket not found, attempting to create it...');
        exists = await createAvatarsBucketIfNeeded();
      }

      setBucketReady(exists);
      if (!exists) {
        console.warn('Avatars bucket not ready - uploads will be disabled');
      } else {
        console.log('Avatars bucket is ready!');
      }
    };
    checkBucket();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check bucket status
    let ready = bucketReady;
    if (!ready) {
      console.log('Bucket not ready, attempting to create/enable...');
      let exists = await ensureAvatarsBucketExists();
      if (!exists) {
        exists = await createAvatarsBucketIfNeeded();
      }
      setBucketReady(exists);
      ready = exists;
    }

    if (!ready) {
      toast({
        title: 'Storage not available',
        description: 'Photo upload storage is being initialized. Please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setIsUploading(true);
    try {
      console.log('Starting avatar upload for user:', userId);
      
      // Double-check bucket exists, try to create if needed
      let bucketExists = await ensureAvatarsBucketExists();
      if (!bucketExists) {
        console.log('Bucket not found, attempting to create...');
        bucketExists = await createAvatarsBucketIfNeeded();
      }

      if (!bucketExists) {
        console.error('Storage bucket could not be created or accessed');
        toast({
          title: 'Storage configuration needed',
          description: 'Please ensure the avatars bucket exists. Contact support if this persists.',
          variant: 'destructive',
        });
        setIsUploading(false);
        setPreview(currentAvatarUrl || null);
        return;
      }

      console.log('Bucket is ready, proceeding with upload...');
      setBucketReady(true);

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop();
        if (oldFileName) {
          try {
            console.log('Deleting old avatar:', oldFileName);
            await supabase.storage.from('avatars').remove([`${userId}/${oldFileName}`]);
          } catch (e) {
            // Ignore deletion errors
            console.log('Could not delete old avatar (not critical):', e);
          }
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${userId}/avatar-${timestamp}.${file.name.split('.').pop()}`;
      console.log('Uploading file as:', fileName);

      // Upload new avatar
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: false });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      const avatarUrl = publicData.publicUrl;
      console.log('Public URL:', avatarUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully');
      
      toast({
        title: 'Success!',
        description: 'Profile photo updated successfully.',
      });

      setIsDialogOpen(false);
      onUploadComplete(avatarUrl);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setPreview(currentAvatarUrl || null);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!preview) return;

    setIsUploading(true);
    try {
      // Delete from storage
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop();
        if (oldFileName) {
          try {
            await supabase.storage.from('avatars').remove([`${userId}/${oldFileName}`]);
          } catch (e) {
            console.log('Could not delete avatar from storage');
          }
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', userId);

      if (error) throw error;

      setPreview(null);
      setIsDialogOpen(false);
      toast({
        title: 'Removed',
        description: 'Profile photo has been removed.',
      });

      onUploadComplete('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove photo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Avatar - clickable to open dialog */}
      <div 
        className="relative cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsDialogOpen(true)}
      >
        <Avatar className="h-32 w-32">
          <AvatarImage src={preview || ''} />
          <AvatarFallback className="text-4xl bg-secondary text-secondary-foreground">
            {userName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
            <DialogDescription>
              Upload a new profile photo or remove your current one
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* Preview */}
            <div className="relative">
              <Avatar className="h-40 w-40">
                <AvatarImage src={preview || ''} />
                <AvatarFallback className="text-5xl bg-secondary text-secondary-foreground">
                  {userName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !bucketReady}
                className="gap-2 bg-secondary hover:bg-secondary/90"
              >
                <Upload className="h-4 w-4" />
                {!bucketReady ? 'Storage Not Setup' : isUploading ? 'Uploading...' : 'Choose Photo'}
              </Button>

              {!bucketReady && (
                <p className="text-xs text-red-500 text-center px-2">
                  Storage is initializing... Try refreshing the page in a moment.
                </p>
              )}

              {preview && (
                <Button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="gap-2 bg-red-500 hover:bg-red-600 text-white"
                >
                  <X className="h-4 w-4" />
                  Remove Photo
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG or GIF • Max 5MB
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
