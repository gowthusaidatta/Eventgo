# Backend Quick Start

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Update `backend/.env` with your Cognito credentials:
```env
COGNITO_CLIENT_ID=1aaa70jh0p40i6lvd95fa1514p
COGNITO_CLIENT_SECRET=your_secret_from_cognito_console
```

### 3. Run Backend
```bash
npm start        # Production
npm run dev      # Development with auto-reload
```

Backend will start on `http://localhost:3000`

---

## 📋 Required Configuration

From your Cognito setup, you need:

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `COGNITO_CLIENT_ID` | Cognito Console → App clients | `1aaa70jh0p40i6lvd95fa1514p` |
| `COGNITO_CLIENT_SECRET` | Cognito Console → App clients → Show Details | `xxxxxx...` |
| `COGNITO_USER_POOL_ID` | Cognito Console → General Settings | `us-east-1_BbMXbB31e` |
| `AWS_ACCESS_KEY_ID` | AWS IAM Console | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Console | `...` |

---

## 🔗 Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Health check |
| `GET /auth/login` | Start login flow |
| `GET /auth/logout` | Logout |
| `GET /auth/user` | Current user info (requires auth) |
| `GET /api/events` | Get all events |
| `POST /api/events` | Create event (requires auth) |
| `GET /api/users/:id` | Get user profile (requires auth) |

---

## 💡 Frontend Integration

### Make Authenticated Requests from React

```javascript
// Always include credentials to send session cookies
fetch('http://localhost:3000/api/events', {
    credentials: 'include'  // ← IMPORTANT
})
```

### Login Handler

```javascript
const handleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/login';
};
```

### Check if User is Authenticated

```javascript
const checkAuth = async () => {
    const res = await fetch('http://localhost:3000/auth/user', {
        credentials: 'include'
    });
    return res.ok;
};
```

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| `Cannot find module 'openid-client'` | Run `npm install` |
| `CORS error` | Check FRONTEND_URL in .env |
| `Unauthorized on /api/events` | Ensure `credentials: 'include'` in fetch |
| `DynamoDB error` | Verify AWS credentials and table names |
| `Cognito discovery failed` | Check COGNITO_DOMAIN format |

---

## 📊 Database Setup

Ensure these DynamoDB tables exist:

```
Table Name: Datta-Evntgo-Datta-2005-users
Primary Key: userId

Table Name: Datta-Evntgo-Datta-2005-events  
Primary Key: eventId

Table Name: Datta-Evntgo-Datta-2005-opportunities
Primary Key: opportunityId
```

---

## 🔐 Security Notes

1. Change `SESSION_SECRET` in production to a random string
2. Rotate AWS credentials regularly
3. Keep `COGNITO_CLIENT_SECRET` secure (never commit to git)
4. Use HTTPS in production
5. Enable CloudTrail for AWS audit logging

---

## 📚 Full Documentation

See [COGNITO-SETUP.md](./COGNITO-SETUP.md) for complete setup guide with detailed instructions.

---

## 🆘 Need Help?

1. Check `COGNITO-SETUP.md` for detailed setup
2. Review `README.md` for API documentation
3. Check `.env` file for all required variables
4. Verify DynamoDB tables are created
5. Review error logs in terminal
