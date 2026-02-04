# EventGo Backend Server

Complete Node.js Express backend with AWS Cognito authentication, DynamoDB, and S3 integration.

## 📋 Prerequisites

- Node.js 20+ installed
- AWS Cognito User Pool created
- DynamoDB tables configured
- S3 bucket for media storage
- Environment variables configured

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create/update `.env` file with your Cognito and AWS credentials:

```env
COGNITO_DOMAIN=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_BbMXbB31e
COGNITO_CLIENT_ID=1aaa70jh0p40i6lvd95fa1514p
COGNITO_CLIENT_SECRET=your_client_secret_here
COGNITO_REDIRECT_URI=https://d84l1y8p4kdic.cloudfront.net/callback
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 🔐 Authentication Flow

### 1. User Login
- Redirect to `/auth/login`
- User redirected to Cognito login page
- After authentication, redirected to `/auth/callback`

### 2. Session Management
- User session stored in Express session
- Token set stored in session for API calls
- Session expires after 24 hours (configurable)

### 3. Protected Routes
- All `/api/*` routes require authentication
- Use `requireAuth` middleware to protect routes
- Check `req.session.userInfo` for user data

## 📡 API Endpoints

### Authentication
- `GET /auth/login` - Initiate login flow
- `GET /auth/callback` - Cognito callback (automatic)
- `GET /auth/logout` - Logout and destroy session
- `GET /auth/user` - Get current authenticated user

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:eventId` - Get single event
- `POST /api/events` - Create new event (requires auth)
- `PUT /api/events/:eventId` - Update event (requires auth)
- `DELETE /api/events/:eventId` - Delete event (requires auth)

### Opportunities
- `GET /api/opportunities` - Get all opportunities
- `GET /api/opportunities/:opportunityId` - Get single opportunity

## 🔧 Key Features

### Session-Based Authentication
- Uses OpenID Connect (OIDC)
- HTTP-only, secure cookies
- CORS enabled for frontend

### DynamoDB Integration
- Automatic user creation on first login
- Event and opportunity management
- Flexible schema for additional fields

### Error Handling
- Comprehensive error logging
- Proper HTTP status codes
- User-friendly error messages

## 🔄 Frontend Integration

### Login Flow
```javascript
// In React component
const handleLogin = () => {
    window.location.href = 'http://backend-url/auth/login';
};
```

### Fetch Protected Resources
```javascript
const getEvents = async () => {
    const response = await fetch('http://backend-url/api/events', {
        credentials: 'include', // Important: include cookies
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};
```

### Check Authentication Status
```javascript
const checkAuth = async () => {
    const response = await fetch('http://backend-url/auth/user', {
        credentials: 'include'
    });
    return response.json();
};
```

## 📊 DynamoDB Schema

### Users Table
```json
{
    "userId": "cognito-sub",
    "email": "user@example.com",
    "username": "username",
    "fullName": "Full Name",
    "phone": "+1234567890",
    "avatar": "s3-url",
    "role": "user|admin|college",
    "lastLogin": "2026-02-04T...",
    "createdAt": "2026-02-04T..."
}
```

### Events Table
```json
{
    "eventId": "event_123456",
    "creatorId": "cognito-sub",
    "title": "Event Title",
    "description": "...",
    "startDate": "2026-03-01",
    "endDate": "2026-03-02",
    "location": "...",
    "createdAt": "2026-02-04T...",
    "updatedAt": "2026-02-04T..."
}
```

## 🐛 Troubleshooting

### Issue: "Unauthorized" on protected routes
- Ensure cookies are being sent with requests (`credentials: 'include'`)
- Check session secret is configured
- Verify Cognito tokens are valid

### Issue: CORS errors
- Frontend URL must match `FRONTEND_URL` env variable
- Check CORS configuration in app.js

### Issue: DynamoDB connection fails
- Verify AWS credentials are correct
- Ensure IAM user has DynamoDB permissions
- Check table names match environment variables

## 📝 Notes

- Change `SESSION_SECRET` in production
- Rotate AWS credentials regularly
- Enable CloudTrail for AWS API auditing
- Use HTTPS in production
- Add rate limiting for production deployment
