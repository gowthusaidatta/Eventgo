// AWS SDK Configuration
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

// Cognito Configuration
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 Configuration for file uploads
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

// DynamoDB Configuration (optional for real-time data)
export const dynamoClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
});

// Cognito Configuration
export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID || '',
  clientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID || '',
  domain: import.meta.env.VITE_AWS_COGNITO_DOMAIN || '',
  region: AWS_REGION,
  redirectUri: `${window.location.origin}/auth/callback`,
  responseType: 'code',
  scope: 'email openid profile',
};

// S3 Configuration
export const s3Config = {
  bucket: import.meta.env.VITE_AWS_S3_BUCKET || 'evntgo-storage',
  region: import.meta.env.VITE_AWS_S3_REGION || 'us-east-1',
  prefixes: {
    profilePictures: import.meta.env.VITE_AWS_S3_PROFILE_PICTURES_PREFIX || 'profile-pictures/',
    eventImages: import.meta.env.VITE_AWS_S3_EVENT_IMAGES_PREFIX || 'event-images/',
    videos: import.meta.env.VITE_AWS_S3_VIDEOS_PREFIX || 'videos/',
    documents: import.meta.env.VITE_AWS_S3_DOCUMENTS_PREFIX || 'documents/',
  },
  cloudfront: import.meta.env.VITE_AWS_CLOUDFRONT_DOMAIN || '',
};

// RDS Configuration
export const rdsConfig = {
  host: import.meta.env.VITE_AWS_RDS_HOST || '',
  port: parseInt(import.meta.env.VITE_AWS_RDS_PORT || '5432'),
  database: import.meta.env.VITE_AWS_RDS_DATABASE || 'evntgo_db',
  user: import.meta.env.VITE_AWS_RDS_USER || 'admin',
  password: import.meta.env.VITE_AWS_RDS_PASSWORD || '',
};
