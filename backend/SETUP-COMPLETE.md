# Backend Setup Complete ✅

Your Node.js Express backend with AWS Cognito authentication and DynamoDB integration has been successfully created!

## 📁 Backend Structure

```
backend/
├── app.js                    # Main Express server with Cognito auth
├── services.js              # DynamoDB & S3 service layer
├── package.json             # Dependencies
├── .env                      # Environment configuration (update with your secrets)
├── .gitignore              # Git ignore patterns
├── Dockerfile              # Docker container configuration
├── README.md               # Complete API documentation
├── COGNITO-SETUP.md        # Detailed Cognito integration guide
└── QUICKSTART.md           # Quick start guide
```

## 🎯 What's Included

### Core Features
- ✅ AWS Cognito OpenID Connect authentication
- ✅ Session-based user management
- ✅ DynamoDB integration for users, events, opportunities
- ✅ S3 file upload integration with CloudFront
- ✅ CORS enabled for frontend communication
- ✅ Error handling and logging
- ✅ Health checks and monitoring

### API Endpoints (13 total)

**Authentication (4 endpoints)**
- `GET /auth/login` - Initiate login with Cognito
- `GET /auth/callback` - Cognito redirect handler
- `GET /auth/logout` - Logout and destroy session
- `GET /auth/user` - Get current authenticated user

**Users (2 endpoints)**
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update user profile

**Events (5 endpoints)**
- `GET /api/events` - Get all events
- `GET /api/events/:eventId` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event

**Opportunities (2 endpoints)**
- `GET /api/opportunities` - Get all opportunities
- `GET /api/opportunities/:opportunityId` - Get single opportunity

## 🚀 Next Steps

### 1. Update Configuration
```bash
cd backend
# Edit .env and fill in your Cognito credentials
nano .env
```

**Required values from Cognito setup:**
- `COGNITO_CLIENT_ID` - From Cognito console
- `COGNITO_CLIENT_SECRET` - From Cognito console (Show Details)
- `AWS_ACCESS_KEY_ID` - Your AWS credentials
- `AWS_SECRET_ACCESS_KEY` - Your AWS credentials

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Backend
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Test the Server
```bash
# In another terminal
curl http://localhost:3000

# Should return:
# {
#   "message": "Welcome to EventGo Backend",
#   "authenticated": false,
#   "loginUrl": "/auth/login"
# }
```

## 🔐 Cognito Configuration Required

Before the backend works, you must configure Cognito:

### In AWS Cognito Console:

1. **Go to your User Pool** → `eventgo-autho`
2. **App Integration** → **App clients and settings**
3. **Update Allowed callback URLs:**
   ```
   https://d84l1y8p4kdic.cloudfront.net/callback
   https://d84l1y8p4kdic.cloudfront.net/auth/callback
   http://localhost:3000/auth/callback
   ```

4. **Update Allowed sign-out URLs:**
   ```
   https://d84l1y8p4kdic.cloudfront.net
   http://localhost:3000
   ```

5. **Verify OAuth scopes** are enabled:
   - openid
   - email
   - profile
   - phone

6. **Get Client Secret:**
   - Click "Show Details" button
   - Copy the App client secret
   - Paste into `.env` file as `COGNITO_CLIENT_SECRET`

## 🔌 Frontend Integration

### React Component Example: Login Button
```javascript
const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:3000/auth/login';
    };
    
    return <button onClick={handleLogin}>Login with Cognito</button>;
};
```

### Fetch Events (Authenticated)
```javascript
useEffect(() => {
    fetch('http://localhost:3000/api/events', {
        credentials: 'include' // Important: send cookies
    })
    .then(res => res.json())
    .then(data => setEvents(data))
    .catch(err => console.error('Error:', err));
}, []);
```

## 📊 DynamoDB Tables Required

Verify these tables exist in DynamoDB:

| Table Name | Primary Key | Status |
|----------|-----------|--------|
| `Datta-Evntgo-Datta-2005-users` | `userId` (String) | ✅ Must exist |
| `Datta-Evntgo-Datta-2005-events` | `eventId` (String) | ✅ Must exist |
| `Datta-Evntgo-Datta-2005-opportunities` | `opportunityId` (String) | ✅ Must exist |

## 🐳 Docker Deployment

### Build and Run
```bash
cd backend

# Build image
docker build -t eventgo-backend .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name eventgo-backend \
  eventgo-backend
```

### Check Container
```bash
docker ps
docker logs eventgo-backend
```

## ✅ Verification Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file has all Cognito values
- [ ] Cognito redirect URLs are configured
- [ ] DynamoDB tables created and accessible
- [ ] AWS credentials are correct
- [ ] Backend starts without errors (`npm start`)
- [ ] Can access `http://localhost:3000/`
- [ ] Can access `http://localhost:3000/auth/login`
- [ ] Session cookies are being set
- [ ] Frontend can communicate with backend

## 📚 Documentation Files

- **README.md** - Complete API reference and backend documentation
- **COGNITO-SETUP.md** - Detailed Cognito integration guide with all steps
- **QUICKSTART.md** - Quick reference for common tasks
- **services.js** - DynamoDB and S3 service functions
- **app.js** - Main Express server with all routes

## 🆘 Support

### Common Issues:

**Error: "Cannot find module 'openid-client'"**
```bash
npm install openid-client
```

**Error: "Cognito discovery failed"**
- Check `COGNITO_DOMAIN` is correct format
- Verify AWS region is `us-east-1`

**Error: "Unauthorized on /api/events"**
- Ensure `credentials: 'include'` in fetch
- Check session is created after login

**Error: "DynamoDB table not found"**
- Verify table names in `.env`
- Check table exists in DynamoDB console
- Verify AWS credentials have DynamoDB permissions

---

## 🎉 You're All Set!

Your backend is ready to integrate with your React frontend. 

**Frontend** → `http://localhost:80` (Docker)
**Backend** → `http://localhost:3000` (Development)

See **COGNITO-SETUP.md** for complete integration details!
