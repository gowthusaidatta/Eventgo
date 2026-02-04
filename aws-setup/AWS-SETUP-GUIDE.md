# AWS Setup Guide for EvntGo

## Prerequisites
- AWS Account
- AWS CLI installed
- Node.js 18+

## Architecture Overview

```
Frontend (React)
    ↓
AWS Cognito (Authentication)
    ↓
API Backend (Node.js/Express)
    ↓
AWS DynamoDB (NoSQL Database)
    ↓
AWS S3 (File Storage)
    ↓
AWS CloudFront (CDN)
```

---

## Step 1: DynamoDB Tables (Already Created)

### Pre-configured Tables:

**1. Users Table**
- Table Name: `Datta-Evntgo-Datta-2005-users`
- Primary Key: `userId` (String)
- No provisioned capacity needed (On-demand billing)

**2. Events Table**
- Table Name: `Datta-Evntgo-Datta-2005-events`
- Primary Key: `eventId` (String)
- On-demand billing

**3. Opportunities Table**
- Table Name: `Datta-Evntgo-Datta-2005-opportunities`
- Primary Key: `oppId` (String)
- On-demand billing

### Test Insert Command:

```bash
aws dynamodb put-item \
  --table-name Datta-Evntgo-Datta-2005-users \
  --item '{
    "userId": {"S": "u-test-001"},
    "email": {"S": "test@eventgo.tech"},
    "fullName": {"S": "Test User"},
    "role": {"S": "user"},
    "createdAt": {"S": "2026-02-04T15:00:00Z"}
  }' \
  --region us-east-1
```

**No additional setup needed for DynamoDB tables**

---

## Step 2: AWS Cognito Setup (Authentication)

```bash
# Using AWS Console
1. Navigate to Cognito > User pools > Create user pool
2. Configure sign-in:
   - Email/Username
   - Enable self-registration
3. Password requirements:
   - Minimum length: 12
   - Require uppercase, lowercase, numbers, special characters
4. MFA: Optional (for development)
5. App client settings:
   - App name: evntgo-app
   - Client secret: Generate
   - Allowed OAuth flows: Code
   - Allowed OAuth scopes: email, openid, profile
   - Callback URL: http://localhost:8081/auth/callback
   - Sign out URL: http://localhost:8081/
6. App domain:
   - Domain prefix: evntgo-auth
```

**Update .env.aws with Cognito User Pool ID and Client ID**

---

## Step 3: S3 Bucket Setup (File Storage)

```bash
# Using AWS CLI
aws s3 mb s3://evntgo-storage --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket evntgo-storage \
  --versioning-configuration Status=Enabled

# Enable public access for CDN
aws s3api put-bucket-public-access-block \
  --bucket evntgo-storage \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Create bucket policy
aws s3api put-bucket-policy --bucket evntgo-storage --policy file://bucket-policy.json

# Enable CORS
aws s3api put-bucket-cors --bucket evntgo-storage --cors-configuration file://cors-config.json
```

---

## Step 4: CloudFront Distribution (CDN)

```bash
# Using AWS Console
1. CloudFront > Distributions > Create distribution
2. Origin domain: evntgo-storage.s3.us-east-1.amazonaws.com
3. Origin path: (leave blank)
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Cache policy: CachingOptimized
6. Alternate domain names: cdn.evntgo.com (optional)
7. Create SSL certificate via ACM if needed
```

**Update .env.aws with CloudFront domain**

---

## Step 5: IAM Role for Backend (Production)

### Production Setup (EC2/Lambda)
- **Role Name:** `Datta-Evntgo-Datta-2005-lambda-role`
- **Attached Policies:**
  - `Datta-Evntgo-Datta-2005-DynamoDB-Access`
  - `AmazonDynamoDBFullAccess` (temporary)
  - `CloudWatchLogsFullAccess`

### Development Setup (Local)
Use temporary credentials (will be rotated):
```
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
```

---

## Step 6: DynamoDB Schema (Data Models)

### Users Table
```json
{
  "userId": "string (UUID, PK)",
  "email": "string (GSI)",
  "fullName": "string",
  "role": "user | admin | college | company",
  "collegeId": "string (optional)",
  "avatarUrl": "string (S3 URL)",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

### Events Table
```json
{
  "eventId": "string (UUID, PK)",
  "title": "string",
  "description": "string",
  "college": "string",
  "imageUrl": "string (S3 URL)",
  "startDate": "ISO timestamp",
  "endDate": "ISO timestamp",
  "location": "string",
  "createdBy": "userId (GSI)",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### Opportunities Table
```json
{
  "oppId": "string (UUID, PK)",
  "title": "string",
  "type": "job | internship",
  "description": "string",
  "company": "string",
  "location": "string",
  "salaryMin": "number (optional)",
  "salaryMax": "number (optional)",
  "imageUrl": "string (S3 URL)",
  "createdBy": "userId (GSI)",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

---

## Security Checklist

- [ ] DynamoDB on-demand pricing enabled
- [ ] S3 bucket encryption enabled
- [ ] CloudFront cache policies configured
- [ ] IAM role attached to EC2/Lambda
- [ ] Cognito MFA enabled (production)
- [ ] CloudWatch monitoring active
- [ ] API rate limiting configured
- [ ] DynamoDB point-in-time recovery enabled
- [ ] AWS Secrets Manager for sensitive data
- [ ] Regular security audits

---

## AWS Cost Estimates (Monthly - DynamoDB)

| Service | Usage | Est. Cost |
|---------|-------|-----------|
| **DynamoDB** | On-demand | ~$5-25 |
| **S3** | ~100GB storage | ~$2-5 |
| **Cognito** | Up to 50K MAU | Free |
| **CloudFront** | 100GB transfer | ~$8-10 |
| **Data Transfer** | Out of region | ~$5-10 |
| **Total** | | **~$20-50** |

*DynamoDB on-demand is more cost-effective for variable workloads*
