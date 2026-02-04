# EventGo Backend Setup Guide - Cognito Integration

Complete guide to set up your Node.js backend with AWS Cognito authentication and DynamoDB integration.

## 🎯 Cognito Setup Steps

### Step 1: Retrieve Cognito Configuration

From the Cognito setup instructions you received:

```
User Pool ID: us-east-1_BbMXbB31e
Client ID: 1aaa70jh0p40i6lvd95fa1514p
Domain: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_BbMXbB31e
CloudFront Domain: d84l1y8p4kdic.cloudfront.net
```

### Step 2: Configure Redirect URLs in Cognito Console

1. Go to AWS Cognito Console
2. Select User Pool: `User pool - udt7h-`
3. Go to App Integration → App clients and settings
4. Update the following:

**Allowed callback URLs:**
```
https://d84l1y8p4kdic.cloudfront.net/callback
https://d84l1y8p4kdic.cloudfront.net/auth/callback
http://localhost:3000/auth/callback
```

**Allowed sign-out URLs:**
```
https://d84l1y8p4kdic.cloudfront.net
https://d84l1y8p4kdic.cloudfront.net/logout
http://localhost:3000/logout
```

**Allowed OAuth scopes:**
- openid
- email
- profile
- phone

### Step 3: Get Client Secret

1. In Cognito Console → App clients
2. Click on your app
3. Show Details → App client secret
4. Copy and save (keep secure)

### Step 4: Set Up Backend Environment

1. Navigate to backend directory:
```bash
cd backend
```

2. Update `.env` file with your credentials:

```env
# Cognito Configuration
COGNITO_DOMAIN=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_BbMXbB31e
COGNITO_CLIENT_ID=1aaa70jh0p40i6lvd95fa1514p
COGNITO_CLIENT_SECRET=your_client_secret_from_step_3
COGNITO_REDIRECT_URI=https://d84l1y8p4kdic.cloudfront.net/callback
COGNITO_USER_POOL_ID=us-east-1_BbMXbB31e
COGNITO_REGION=us-east-1

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# DynamoDB Tables
DYNAMODB_USERS_TABLE=Datta-Evntgo-Datta-2005-users
DYNAMODB_EVENTS_TABLE=Datta-Evntgo-Datta-2005-events
DYNAMODB_OPPORTUNITIES_TABLE=Datta-Evntgo-Datta-2005-opportunities

# S3 Configuration
S3_BUCKET_NAME=eventgo-media-bucket
CLOUDFRONT_DOMAIN_NAME=d84l1y8p4kdic.cloudfront.net

# Server Configuration
SERVER_PORT=3000
SERVER_HOST=0.0.0.0
SESSION_SECRET=change_this_to_secure_random_string

# Frontend URL
FRONTEND_URL=https://d84l1y8p4kdic.cloudfront.net
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Start the Backend

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 🔐 Authentication Flow

### 1. User Initiates Login
```
Frontend → GET /auth/login
```

### 2. Backend Redirects to Cognito
```
Backend → Cognito Login Page
Cognito generates authorization code
```

### 3. User Authenticates
```
User enters credentials in Cognito managed login page
```

### 4. Cognito Redirects Back to Backend
```
Cognito → GET /auth/callback?code=...&state=...
```

### 5. Backend Exchanges Code for Tokens
```
Backend exchanges authorization code for:
- Access Token
- ID Token
- Refresh Token
```

### 6. Backend Creates Session
```
User info stored in req.session
DynamoDB records created/updated
Session cookie sent to frontend
```

### 7. Frontend Makes Authenticated Requests
```
Frontend → GET /api/events (with credentials: 'include')
Backend validates session
DynamoDB query executed
Response returned
```

## 📡 API Usage Examples

### Login with OpenID Connect

**Step 1: User clicks login button in React**
```javascript
// In React component
const handleLogin = () => {
    window.location.href = 'http://your-backend-url/auth/login';
};
```

**Step 2: Backend redirects to Cognito** (automatic)
```
GET http://your-backend-url/auth/login
↓ Redirects to ↓
https://cognito-idp.us-east-1.amazonaws.com/...authorize...
```

**Step 3: After Cognito authentication** (automatic)
```
Cognito redirects to /auth/callback with authorization code
Backend exchanges code for tokens
Session created with user info
Redirects back to frontend
```

### Fetch Protected Resources

```javascript
// React component
const fetchEvents = async () => {
    const response = await fetch('http://your-backend-url/api/events', {
        method: 'GET',
        credentials: 'include', // IMPORTANT: Send cookies with request
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }
    
    return response.json();
};
```

### Create Event (Authenticated)

```javascript
const createEvent = async (eventData) => {
    const response = await fetch('http://your-backend-url/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: 'My Event',
            description: 'Event description',
            startDate: '2026-03-01',
            endDate: '2026-03-02',
            location: 'New York'
        })
    });
    
    return response.json();
};
```

### Logout

```javascript
const handleLogout = () => {
    window.location.href = 'http://your-backend-url/auth/logout';
};
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t eventgo-backend .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name eventgo-backend \
  eventgo-backend
```

### Docker Compose

Add to your `docker-compose.yml`:

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
    - COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
    - COGNITO_CLIENT_SECRET=${COGNITO_CLIENT_SECRET}
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
  depends_on:
    - frontend
  restart: always
```

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file configured with all Cognito details
- [ ] Cognito redirect URLs configured
- [ ] DynamoDB tables created and accessible
- [ ] AWS credentials have DynamoDB permissions
- [ ] Backend server starts without errors
- [ ] `/` endpoint returns JSON response
- [ ] `/auth/login` redirects to Cognito login page
- [ ] Frontend can make authenticated API requests
- [ ] Session persists across requests

## 🔧 Troubleshooting

### "Cannot find module 'openid-client'"
```bash
npm install
npm install openid-client
```

### "Cognito discovery failed"
- Verify `COGNITO_DOMAIN` is correct
- Ensure AWS region is correct (`us-east-1`)
- Check internet connection

### "DynamoDB connection refused"
- Verify AWS credentials are correct
- Ensure IAM user has DynamoDB:* permissions
- Check table names in `.env`

### "Session cookie not being set"
- Ensure `credentials: 'include'` in fetch requests
- Check `SESSION_SECRET` is configured
- Verify CORS origin matches `FRONTEND_URL`

### "Unauthorized on protected routes"
- Check session is created after login
- Verify cookies are being sent with requests
- Look for Cognito token expiration

## 📚 Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [OpenID Connect Library](https://github.com/panva/node-openid-client)
- [Express Session Documentation](https://github.com/expressjs/session)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
