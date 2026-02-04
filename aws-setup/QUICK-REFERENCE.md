# 📋 EventGo – Quick Reference Card

## 🎯 At a Glance

**Project:** EventGo (Event Management + Job Portal)
**Database:** AWS DynamoDB (NoSQL)
**Auth:** AWS Cognito
**Storage:** AWS S3
**Region:** us-east-1
**Status:** ✅ Ready for Backend Development

---

## 🔑 Temporary Credentials

```
Access Key: your_aws_access_key_id_here
Secret Key: your_aws_secret_access_key_here
Region: us-east-1

⚠️ Will be rotated weekly
```

---

## 📊 DynamoDB Tables

| Table | Primary Key | GSI | Purpose |
|-------|-------------|-----|---------|
| `Datta-Evntgo-Datta-2005-users` | userId | email | User profiles |
| `Datta-Evntgo-Datta-2005-events` | eventId | createdBy | Events |
| `Datta-Evntgo-Datta-2005-opportunities` | oppId | type | Jobs/Internships |

---

## 🧪 Test Data Insertion

```bash
# Insert test user
aws dynamodb put-item \
  --table-name Datta-Evntgo-Datta-2005-users \
  --item '{"userId":{"S":"u-test"},"email":{"S":"test@test.com"},"fullName":{"S":"Test"},"role":{"S":"user"},"createdAt":{"S":"2026-02-04T00:00:00Z"},"updatedAt":{"S":"2026-02-04T00:00:00Z"}}' \
  --region us-east-1

# Query test user
aws dynamodb get-item \
  --table-name Datta-Evntgo-Datta-2005-users \
  --key '{"userId":{"S":"u-test"}}' \
  --region us-east-1
```

---

## 💻 Node.js Backend Starter

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

// Create item
await docClient.send(new PutCommand({
  TableName: "Datta-Evntgo-Datta-2005-users",
  Item: { userId: "u-1", email: "user@test.com", fullName: "John" }
}));

// Get item
const result = await docClient.send(new GetCommand({
  TableName: "Datta-Evntgo-Datta-2005-users",
  Key: { userId: "u-1" }
}));
```

---

## 🌐 API Endpoints (To Create)

```
POST   /api/users              Create user
GET    /api/users/:id          Get user
PUT    /api/users/:id          Update user
GET    /api/users              List users

POST   /api/events             Create event
GET    /api/events             List events
GET    /api/events/:id         Get event
PUT    /api/events/:id         Update event
DELETE /api/events/:id         Delete event

POST   /api/opportunities      Create job/internship
GET    /api/opportunities      List
GET    /api/opportunities/:id  Get details
PUT    /api/opportunities/:id  Update
DELETE /api/opportunities/:id  Delete
```

---

## 📝 Frontend Usage

```typescript
// Import services
import { userService, eventService } from '@/integrations/aws/dynamodb';
import { uploadAvatar } from '@/integrations/aws/s3';
import { signUp, signIn } from '@/integrations/aws/cognito';

// Create user
await userService.createUser({
  userId: "u-123",
  email: "user@college.edu",
  fullName: "John Doe",
  role: "user"
});

// Get user
const result = await userService.getUser("u-123");
if (result.success) console.log(result.data);

// Upload avatar
const upload = await uploadAvatar(file, "u-123");
if (upload.success) console.log(upload.url);
```

---

## 🛠️ Backend Setup (5 Minutes)

```bash
# 1. Create project
mkdir evntgo-backend && cd evntgo-backend
npm init -y

# 2. Install packages
npm install express cors dotenv @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# 3. Create .env
echo "AWS_REGION=us-east-1" > .env
echo "DYNAMODB_USERS_TABLE=Datta-Evntgo-Datta-2005-users" >> .env
echo "PORT=3000" >> .env

# 4. Create index.js (Express server)
# [See BACKEND-DYNAMODB-SETUP.md for full code]

# 5. Start server
npm start
```

---

## 🔄 Frontend Environment

```bash
# .env in frontend
VITE_AWS_REGION=us-east-1
VITE_AWS_DYNAMODB_USERS_TABLE=Datta-Evntgo-Datta-2005-users
VITE_AWS_DYNAMODB_EVENTS_TABLE=Datta-Evntgo-Datta-2005-events
VITE_AWS_DYNAMODB_OPPORTUNITIES_TABLE=Datta-Evntgo-Datta-2005-opportunities
VITE_AWS_S3_BUCKET=evntgo-storage
```

---

## 🚀 Deployment Steps

```bash
# 1. EC2 Instance (Ubuntu 22.04)
ssh -i key.pem ubuntu@ec2-instance-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git

# 3. Clone & Setup
git clone [repo-url]
cd evntgo/backend
npm install
cp .env.example .env  # Update with values

# 4. Start with PM2
sudo npm install -g pm2
pm2 start app.js --name "evntgo-api"
pm2 startup && pm2 save

# 5. Test
curl http://localhost:3000/health
```

---

## 📦 File Structure (aws-setup/)

```
aws-setup/
├── .env.aws                       # Credentials template
├── AWS-SETUP-GUIDE.md             # Complete setup guide
├── BACKEND-DYNAMODB-SETUP.md      # Backend integration
├── IMPLEMENTATION-GUIDE.md        # Frontend integration
├── SETUP-CHECKLIST.md             # Checklist
├── TEAM-HANDOFF.md                # This document
├── bucket-policy.json
└── cors-config.json
```

---

## ⚡ Common Commands

```bash
# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Describe table
aws dynamodb describe-table \
  --table-name Datta-Evntgo-Datta-2005-users \
  --region us-east-1

# Scan table (first 10 items)
aws dynamodb scan \
  --table-name Datta-Evntgo-Datta-2005-users \
  --limit 10 \
  --region us-east-1

# Query by partition key
aws dynamodb query \
  --table-name Datta-Evntgo-Datta-2005-events \
  --key-condition-expression "createdBy = :id" \
  --expression-attribute-values '{":id":{"S":"u-123"}}' \
  --region us-east-1
```

---

## 🎓 Learning Resources

- **AWS DynamoDB:** https://docs.aws.amazon.com/dynamodb/
- **AWS SDK JS:** https://docs.aws.amazon.com/sdk-for-javascript/v3/
- **Express.js:** https://expressjs.com/
- **Vite React:** https://vitejs.dev/

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ResourceNotFoundException` | Check table name and region |
| `AccessDeniedException` | Verify IAM credentials |
| `ValidationException` | Check attribute names (use reserved word helpers) |
| `ProvisionedThroughputExceededException` | Use on-demand billing |
| `CORS error` | Check frontend URL in S3 CORS config |

---

## ✅ Pre-launch Checklist

- [ ] Backend API created and tested
- [ ] Frontend connected to API
- [ ] Cognito setup complete
- [ ] S3 bucket configured
- [ ] DynamoDB tables populated
- [ ] EC2 instance deployed
- [ ] Monitoring enabled
- [ ] Credentials rotated
- [ ] Security groups configured
- [ ] Backup strategy in place

---

## 📞 Quick Contacts

**AWS Support:** https://console.aws.amazon.com/support/
**Documentation:** https://docs.aws.amazon.com/
**GitHub:** [Repository URL]

---

**Version:** 1.0
**Last Updated:** February 4, 2026
**Next Update:** February 11, 2026
