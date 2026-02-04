# Backend Setup Guide - DynamoDB

## Environment

**Status:** Temporary Development Setup
**Database:** AWS DynamoDB (NoSQL)
**Authentication:** AWS Cognito
**Hosting:** EC2 Ubuntu (Temporary)
**Region:** `us-east-1`

---

## DynamoDB Tables Reference

### Table 1: Users
```
Table Name: Datta-Evntgo-Datta-2005-users
Primary Key: userId (String)
Billing: On-demand
```

**Item Schema:**
```json
{
  "userId": "u-12345678-abcd-efgh",
  "email": "user@college.edu",
  "fullName": "John Doe",
  "role": "user",
  "collegeId": "college-123",
  "avatarUrl": "https://s3.amazonaws.com/evntgo-storage/profile-pictures/...",
  "createdAt": "2026-02-04T15:30:00Z",
  "updatedAt": "2026-02-04T15:30:00Z"
}
```

### Table 2: Events
```
Table Name: Datta-Evntgo-Datta-2005-events
Primary Key: eventId (String)
GSI: createdBy (for querying events by creator)
Billing: On-demand
```

**Item Schema:**
```json
{
  "eventId": "evt-87654321-wxyz-1234",
  "title": "Tech Summit 2026",
  "description": "Annual tech summit...",
  "college": "MIT",
  "imageUrl": "https://s3.amazonaws.com/evntgo-storage/event-images/...",
  "startDate": "2026-03-15T09:00:00Z",
  "endDate": "2026-03-15T17:00:00Z",
  "location": "Cambridge, MA",
  "createdBy": "u-12345678-abcd-efgh",
  "createdAt": "2026-02-04T10:00:00Z",
  "updatedAt": "2026-02-04T10:00:00Z"
}
```

### Table 3: Opportunities
```
Table Name: Datta-Evntgo-Datta-2005-opportunities
Primary Key: oppId (String)
GSI: type (for filtering jobs/internships)
Billing: On-demand
```

**Item Schema:**
```json
{
  "oppId": "opp-11223344-aabb-ccdd",
  "title": "Software Engineer Intern",
  "type": "internship",
  "description": "6-month internship program...",
  "company": "Google",
  "location": "Mountain View, CA",
  "salaryMin": 25,
  "salaryMax": 35,
  "imageUrl": "https://s3.amazonaws.com/evntgo-storage/event-images/...",
  "createdBy": "u-12345678-abcd-efgh",
  "createdAt": "2026-02-04T14:20:00Z",
  "updatedAt": "2026-02-04T14:20:00Z"
}
```

---

## Backend Environment Variables

Create `.env` in your backend directory:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# DynamoDB Tables
DYNAMODB_USERS_TABLE=Datta-Evntgo-Datta-2005-users
DYNAMODB_EVENTS_TABLE=Datta-Evntgo-Datta-2005-events
DYNAMODB_OPPORTUNITIES_TABLE=Datta-Evntgo-Datta-2005-opportunities

# Cognito (for token validation)
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx

# S3
AWS_S3_BUCKET=evntgo-storage
AWS_S3_REGION=us-east-1

# API
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8081
```

---

## Backend Setup (Node.js/Express)

### 1. Install Dependencies

```bash
npm install express axios dotenv cors
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install jsonwebtoken
```

### 2. Initialize DynamoDB Client

**File:** `backend/config/dynamodb.js`

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1"
});

const docClient = DynamoDBDocumentClient.from(client);

export default docClient;
```

### 3. Create API Endpoints

**File:** `backend/routes/users.js`

```javascript
import { Router } from "express";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import docClient from "../config/dynamodb.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE;

// Create User
router.post("/", async (req, res) => {
  try {
    const { email, fullName, role = "user" } = req.body;
    
    const user = {
      userId: uuidv4(),
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    });

    await docClient.send(command);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    });

    const result = await docClient.send(command);
    res.json(result.Item || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 4. Test Insert (CLI)

```bash
aws dynamodb put-item \
  --table-name Datta-Evntgo-Datta-2005-users \
  --item '{
    "userId": {"S": "u-test-001"},
    "email": {"S": "test@eventgo.tech"},
    "fullName": {"S": "Test User"},
    "role": {"S": "user"},
    "createdAt": {"S": "2026-02-04T15:00:00Z"},
    "updatedAt": {"S": "2026-02-04T15:00:00Z"}
  }' \
  --region us-east-1
```

### 5. Query Data (CLI)

```bash
# Get User by ID
aws dynamodb get-item \
  --table-name Datta-Evntgo-Datta-2005-users \
  --key '{"userId": {"S": "u-test-001"}}' \
  --region us-east-1

# Scan all items (limited to 1MB)
aws dynamodb scan \
  --table-name Datta-Evntgo-Datta-2005-users \
  --region us-east-1
```

---

## IAM Role for Production (EC2/Lambda)

**Role Name:** `Datta-Evntgo-Datta-2005-lambda-role`

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Permissions Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Datta-Evntgo-Datta-2005-users",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Datta-Evntgo-Datta-2005-events",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Datta-Evntgo-Datta-2005-opportunities"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::evntgo-storage/*"
    }
  ]
}
```

---

## Deployment (EC2)

### EC2 Ubuntu Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repository
git clone https://github.com/your-repo/evntgo.git
cd evntgo/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
AWS_REGION=us-east-1
DYNAMODB_USERS_TABLE=Datta-Evntgo-Datta-2005-users
DYNAMODB_EVENTS_TABLE=Datta-Evntgo-Datta-2005-events
DYNAMODB_OPPORTUNITIES_TABLE=Datta-Evntgo-Datta-2005-opportunities
NODE_ENV=development
PORT=3000
EOF

# Start server
npm start
```

### With PM2 (Production)

```bash
# Install PM2
sudo npm install -g pm2

# Start app
pm2 start app.js --name "evntgo-api"

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

---

## Monitoring & Logging

### CloudWatch Logs

```bash
# View logs from backend
aws logs tail /aws/ec2/evntgo-api --follow --region us-east-1

# Create log group
aws logs create-log-group --log-group-name /aws/dynamodb/evntgo --region us-east-1
```

---

## DynamoDB Best Practices

1. **Use On-Demand Billing** - Better for variable workloads
2. **Add GSI for Queries** - Create index on frequently queried fields
3. **Enable Point-in-Time Recovery** - For data protection
4. **Monitor Consumed Capacity** - Use CloudWatch metrics
5. **Use BatchGetItem** - For fetching multiple items
6. **Implement Exponential Backoff** - For rate limiting

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ValidationException` | Invalid attribute names | Use reserved words in ExpressionAttributeNames |
| `ResourceNotFoundException` | Table doesn't exist | Check table name and region |
| `ProvisionedThroughputExceededException` | Rate limited | Use on-demand billing or increase capacity |
| `AccessDeniedException` | IAM permissions | Verify IAM role has DynamoDB permissions |

---

## Useful Commands

```bash
# List all tables
aws dynamodb list-tables --region us-east-1

# Describe table
aws dynamodb describe-table \
  --table-name Datta-Evntgo-Datta-2005-users \
  --region us-east-1

# Update time-to-live (TTL)
aws dynamodb update-time-to-live \
  --table-name Datta-Evntgo-Datta-2005-users \
  --time-to-live-specification AttributeName=expiresAt,Enabled=true \
  --region us-east-1
```

---

## Next Steps

1. Set up backend API endpoints
2. Implement token validation with Cognito
3. Add error handling and logging
4. Deploy to EC2
5. Set up auto-scaling alerts
6. Configure CDN for images

---

**Last Updated:** February 4, 2026
