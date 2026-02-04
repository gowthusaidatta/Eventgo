// AWS S3 Storage Service
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config } from './config';

export interface UploadResult {
  success: boolean;
  message: string;
  url?: string;
  key?: string;
}

// Generate unique file key
const generateFileKey = (prefix: string, originalFilename: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${prefix}${timestamp}-${random}.${extension}`;
};

// Upload file to S3
export const uploadFile = async (
  file: File,
  prefix: string = 'uploads/'
): Promise<UploadResult> => {
  try {
    const fileKey = generateFileKey(prefix, file.name);

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
      Metadata: {
        'uploaded-by': 'evntgo-app',
        'upload-date': new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Generate CloudFront URL if available
    let url = fileKey;
    if (s3Config.cloudfront) {
      url = `https://${s3Config.cloudfront}/${fileKey}`;
    } else {
      url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${fileKey}`;
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      url,
      key: fileKey,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Upload user avatar
export const uploadAvatar = async (file: File, userId: string): Promise<UploadResult> => {
  const prefix = `${s3Config.prefixes.profilePictures}${userId}/`;
  return uploadFile(file, prefix);
};

// Upload event image
export const uploadEventImage = async (file: File, eventId: string): Promise<UploadResult> => {
  const prefix = `${s3Config.prefixes.eventImages}${eventId}/`;
  return uploadFile(file, prefix);
};

// Upload video
export const uploadVideo = async (file: File, userId: string): Promise<UploadResult> => {
  const prefix = `${s3Config.prefixes.videos}${userId}/`;
  return uploadFile(file, prefix);
};

// Upload document
export const uploadDocument = async (file: File, userId: string): Promise<UploadResult> => {
  const prefix = `${s3Config.prefixes.documents}${userId}/`;
  return uploadFile(file, prefix);
};

// Get signed URL for file (for accessing private files)
export const getSignedDownloadUrl = async (fileKey: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return '';
  }
};

// Delete file from S3
export const deleteFile = async (fileKey: string): Promise<UploadResult> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: fileKey,
    });

    await s3Client.send(command);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};

// List files in a prefix (folder)
export const listFiles = async (prefix: string): Promise<string[]> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: s3Config.bucket,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents?.map((obj) => obj.Key || '') || [];
  } catch (error) {
    console.error('Failed to list files:', error);
    return [];
  }
};

// Get public URL for a file
export const getPublicUrl = (fileKey: string): string => {
  if (s3Config.cloudfront) {
    return `https://${s3Config.cloudfront}/${fileKey}`;
  }
  return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${fileKey}`;
};
