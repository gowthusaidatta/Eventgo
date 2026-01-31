import { supabase } from '@/integrations/supabase/client';

export async function ensureAvatarsBucketExists(): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const avatarsBucketExists = buckets?.some(b => b.name === 'avatars');
    
    if (avatarsBucketExists) {
      return true;
    }

    // Try to create the bucket if it doesn't exist
    console.log('Avatars bucket not found, attempting to create...');
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
    });

    if (createError) {
      console.error('Error creating avatars bucket:', createError);
      // Bucket creation might fail due to permissions, but that's okay
      // It just means we need to set it up via migration or dashboard
      return false;
    }

    console.log('Avatars bucket created successfully!', newBucket);
    return true;
  } catch (error) {
    console.error('Error checking/creating avatars bucket:', error);
    return false;
  }
}

export async function createAvatarsBucketIfNeeded(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === 'avatars');
    
    if (exists) {
      return true;
    }

    // Try to create the bucket (may fail if user doesn't have permission)
    console.log('Attempting to create avatars bucket via API...');
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
    });

    if (error) {
      console.log('Could not create bucket via API - admin setup required');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in bucket creation:', error);
    return false;
  }
}
