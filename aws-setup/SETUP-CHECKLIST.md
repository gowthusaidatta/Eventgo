# AWS Setup Checklist

## ⚠️ SECURITY WARNING

Your AWS credentials have been shared publicly. **IMMEDIATE ACTIONS REQUIRED:**

1. **Deactivate Current Access Key**
   - Go to AWS Console > IAM > Users > Select user
   - Click "Access Keys"
   - Deactivate/Delete: `your_old_access_key_id_here`

2. **Create New Access Key**
   - AWS Console > IAM > Users > Create new access key
   - Store securely (use Secrets Manager)

3. **Never Share Credentials**
   - Use environment variables only
   - Use .env files (gitignored)
   - Use AWS Secrets Manager in production
   - Use IAM roles when deployed

---

## AWS Setup Steps

### Phase 1: Initial Setup (Week 1)

- [ ] Create AWS Account
- [ ] Set up billing alerts
- [ ] Create new IAM user for EvntGo app
- [ ] Generate new access keys

### Phase 2: Cognito Setup (Week 1)

- [ ] Create Cognito User Pool
- [ ] Configure password policy
- [ ] Add app client
- [ ] Set callback URLs
- [ ] Create app domain
- [ ] Test signup/signin

### Phase 3: RDS Setup (Week 1-2)

- [ ] Create RDS PostgreSQL instance
- [ ] Configure security group
- [ ] Create database schema (see SQL in guide)
- [ ] Test database connection
- [ ] Set up automated backups
- [ ] Test restore procedure

### Phase 4: S3 Setup (Week 1)

- [ ] Create S3 bucket
- [ ] Enable versioning
- [ ] Configure CORS
- [ ] Set bucket policy
- [ ] Test file upload
- [ ] Test file download

### Phase 5: CloudFront Setup (Week 2)

- [ ] Create CloudFront distribution
- [ ] Point to S3 bucket
- [ ] Configure cache policies
- [ ] Test CDN delivery
- [ ] Add custom domain (optional)

### Phase 6: Backend API (Week 2-3)

- [ ] Set up Node.js/Express backend
- [ ] Create RDS connection pool
- [ ] Implement API endpoints
- [ ] Add JWT authentication
- [ ] Add request validation
- [ ] Deploy to EC2/Lambda

### Phase 7: Frontend Integration (Week 3)

- [ ] Update useAuth hook
- [ ] Update Login component
- [ ] Update Signup component
- [ ] Update file upload components
- [ ] Update data fetching hooks
- [ ] Test end-to-end flows

### Phase 8: Testing & Deployment (Week 3-4)

- [ ] Functional testing
- [ ] Security testing
- [ ] Load testing
- [ ] Deploy to production
- [ ] Monitor CloudWatch
- [ ] Set up alerts

---

## Cost Estimation

| Service | Free Tier | Paid Estimate |
|---------|-----------|---------------|
| **Cognito** | 50k MAU | $0.002 per MAU |
| **RDS** | 12 months t3.micro | $10-15/month |
| **S3** | 5GB storage | $0.023/GB |
| **CloudFront** | 1GB/month | $0.085/GB |
| **Data Transfer** | 1GB/month | $0.09/GB |

**Monthly Estimate: $50-150** (increases with scale)

---

## Environment Variables (.env)

```
# AWS Region
AWS_REGION=us-east-1

# Cognito
VITE_AWS_COGNITO_USER_POOL_ID=us-east-1_XXXXX
VITE_AWS_COGNITO_CLIENT_ID=XXXXX
VITE_AWS_COGNITO_DOMAIN=evntgo-auth.auth.us-east-1.amazoncognito.com

# S3
VITE_AWS_S3_BUCKET=evntgo-storage
VITE_AWS_S3_REGION=us-east-1
VITE_AWS_CLOUDFRONT_DOMAIN=dXXXXX.cloudfront.net

# RDS
VITE_AWS_RDS_HOST=evntgo-db.XXXXX.us-east-1.rds.amazonaws.com
VITE_AWS_RDS_PORT=5432
VITE_AWS_RDS_DATABASE=evntgo_db
VITE_AWS_RDS_USER=admin
VITE_AWS_RDS_PASSWORD=XXXXX

# Backend API
VITE_API_URL=http://localhost:3000
```

---

## Quick Commands

```bash
# Install AWS SDK
npm install @aws-sdk/client-cognito-identity-provider @aws-sdk/client-s3 @aws-sdk/s3-request-presigner amazon-cognito-identity-js

# Create S3 bucket
aws s3 mb s3://evntgo-storage --region us-east-1

# List IAM users
aws iam list-users

# Get RDS endpoints
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,Endpoint.Address]'
```

---

## Production Checklist

- [ ] Remove hardcoded credentials
- [ ] Use Secrets Manager for sensitive data
- [ ] Enable AWS WAF for API protection
- [ ] Set up CloudTrail for audit logging
- [ ] Enable encryption at rest (S3, RDS)
- [ ] Configure VPC and subnets
- [ ] Set up CloudWatch alarms
- [ ] Implement rate limiting
- [ ] Add DDoS protection (Shield)
- [ ] Regular security audits

---

## Support

For issues or questions:
1. Check AWS documentation
2. Review CloudWatch logs
3. Test with AWS CLI
4. Contact AWS support

---

**Last Updated:** February 4, 2026
