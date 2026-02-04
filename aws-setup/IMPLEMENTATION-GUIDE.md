# AWS Integration Implementation Guide

## Files Created

```
aws-setup/
├── .env.aws                      # AWS credentials template
├── AWS-SETUP-GUIDE.md           # Complete AWS setup instructions
├── bucket-policy.json           # S3 bucket policy
└── cors-config.json             # S3 CORS configuration

src/integrations/aws/
├── config.ts                    # AWS SDK configuration
├── cognito.ts                   # Authentication service
├── s3.ts                        # File storage service
└── database.ts                  # Database service
```

## Next Steps

### 1. Update Environment Variables

Copy the AWS credentials to your `.env` file:

```bash
# .env (in project root)
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

VITE_AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
VITE_AWS_COGNITO_DOMAIN=evntgo-auth.auth.us-east-1.amazoncognito.com

VITE_AWS_RDS_HOST=evntgo-db.xxxxxxxxxxxxx.us-east-1.rds.amazonaws.com
VITE_AWS_RDS_PORT=5432
VITE_AWS_RDS_DATABASE=evntgo_db
VITE_AWS_RDS_USER=admin
VITE_AWS_RDS_PASSWORD=YourSecurePassword123!

VITE_AWS_S3_BUCKET=evntgo-storage
VITE_AWS_S3_REGION=us-east-1
VITE_AWS_CLOUDFRONT_DOMAIN=dxxxxx.cloudfront.net
```

### 2. Install AWS SDK Packages

```bash
npm install @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3 @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/s3-request-presigner amazon-cognito-identity-js mysql2
```

### 3. Update Authentication Hook

Replace Supabase auth with AWS Cognito in `src/hooks/useAuth.tsx`:

```typescript
import * as AuthService from '@/integrations/aws/cognito';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      AuthService.getCurrentUser(token).then(setUser);
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
};
```

### 4. Update Login Component

```typescript
import { signIn } from '@/integrations/aws/cognito';

const handleLogin = async (email: string, password: string) => {
  const result = await signIn(email, password);
  if (result.success) {
    // Redirect to dashboard
  }
};
```

### 5. Update Signup Component

```typescript
import { signUp, confirmSignUp } from '@/integrations/aws/cognito';

const handleSignup = async (email: string, password: string, name: string) => {
  const result = await signUp(email, password, name);
  if (result.success) {
    // Show confirmation code input
  }
};

const handleConfirm = async (email: string, code: string) => {
  const result = await confirmSignUp(email, code);
  if (result.success) {
    // Redirect to login
  }
};
```

### 6. Update File Upload Components

```typescript
import { uploadAvatar, uploadEventImage } from '@/integrations/aws/s3';

const handleAvatarUpload = async (file: File) => {
  const result = await uploadAvatar(file, userId);
  if (result.success) {
    setAvatarUrl(result.url);
  }
};
```

### 7. Set Up Backend API

Create a Node.js/Express backend to handle:
- Database queries to RDS
- JWT token validation
- Business logic

Example backend structure:

```
backend/
├── routes/
│   ├── users.js
│   ├── events.js
│   ├── opportunities.js
│   └── colleges.js
├── middleware/
│   └── auth.js
├── config/
│   └── database.js
└── server.js
```

### 8. Database Connection (Backend)

```javascript
// backend/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.AWS_RDS_HOST,
  user: process.env.AWS_RDS_USER,
  password: process.env.AWS_RDS_PASSWORD,
  database: process.env.AWS_RDS_DATABASE,
  port: process.env.AWS_RDS_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### 9. Docker Compose Update

```yaml
version: '3.8'

services:
  eventgo-web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_AWS_COGNITO_USER_POOL_ID=${AWS_COGNITO_USER_POOL_ID}
      - VITE_AWS_COGNITO_CLIENT_ID=${AWS_COGNITO_CLIENT_ID}
      - VITE_AWS_S3_BUCKET=${AWS_S3_BUCKET}
    restart: unless-stopped

  eventgo-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - AWS_RDS_HOST=${AWS_RDS_HOST}
      - AWS_RDS_USER=${AWS_RDS_USER}
      - AWS_RDS_PASSWORD=${AWS_RDS_PASSWORD}
      - AWS_REGION=us-east-1
    depends_on:
      - eventgo-web
```

## Security Checklist

- [ ] Rotate AWS access keys immediately
- [ ] Use IAM roles instead of access keys where possible
- [ ] Enable MFA for AWS Console
- [ ] Set up CloudWatch monitoring
- [ ] Enable S3 bucket versioning
- [ ] Configure RDS backup retention
- [ ] Use Secrets Manager for credentials in production
- [ ] Enable VPC and security groups
- [ ] Set up API rate limiting
- [ ] Implement request validation

## Troubleshooting

### Cognito Issues
- Ensure User Pool ID and Client ID are correct
- Check callback URLs in Cognito app settings
- Verify CORS settings

### S3 Upload Issues
- Check S3 bucket permissions
- Verify CORS configuration
- Ensure IAM user has S3 permissions

### Database Connection Issues
- Verify RDS security group allows connections
- Check database credentials
- Ensure database name is correct

## Support Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
