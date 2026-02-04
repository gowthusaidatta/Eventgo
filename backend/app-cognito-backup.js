require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');
const AWS = require('aws-sdk');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// AWS Configuration
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// OpenID Client initialization
let client;

async function initializeClient() {
    try {
        const issuer = await Issuer.discover(process.env.COGNITO_DOMAIN);
        client = new issuer.Client({
            client_id: process.env.COGNITO_CLIENT_ID,
            client_secret: process.env.COGNITO_CLIENT_SECRET,
            redirect_uris: [process.env.COGNITO_REDIRECT_URI],
            response_types: ['code']
        });
        console.log('✅ OpenID Client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize OpenID Client:', error);
        process.exit(1);
    }
}

// Initialize on startup
initializeClient().catch(console.error);

// Authentication Middleware
const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        req.isAuthenticated = true;
    }
    next();
};

// Protect routes - require authentication
const requireAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        return res.status(401).json({ error: 'Unauthorized. Please login first.' });
    }
    next();
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Home route
app.get('/', checkAuth, (req, res) => {
    if (req.isAuthenticated) {
        res.json({
            message: 'Welcome to EventGo Backend',
            user: req.session.userInfo,
            authenticated: true
        });
    } else {
        res.json({
            message: 'Welcome to EventGo Backend',
            authenticated: false,
            loginUrl: '/auth/login'
        });
    }
});

// Login route
app.get('/auth/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'phone openid email profile',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// Callback route after Cognito login
app.get('/auth/callback', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            process.env.COGNITO_REDIRECT_URI,
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        
        // Store user info in session
        req.session.userInfo = userInfo;
        req.session.tokenSet = tokenSet;

        // Store user in DynamoDB
        await storeUserInDynamoDB(userInfo);

        // Redirect to frontend
        res.redirect(`${process.env.FRONTEND_URL}?authenticated=true`);
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect(`${process.env.FRONTEND_URL}?error=authentication_failed`);
    }
});

// Logout route
app.get('/auth/logout', (req, res) => {
    const userPoolDomain = process.env.COGNITO_DOMAIN.replace('https://cognito-idp.us-east-1.amazonaws.com/', '');
    const logoutUrl = `https://${userPoolDomain}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${process.env.FRONTEND_URL}`;
    
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.redirect(logoutUrl);
    });
});

// Get current user info - optional auth (frontend needs to check auth status on load)
app.get('/auth/user', checkAuth, (req, res) => {
    if (req.isAuthenticated) {
        res.json({
            user: req.session.userInfo,
            authenticated: true
        });
    } else {
        res.json({
            user: null,
            authenticated: false
        });
    }
});

// ============================================
// USER ROUTES
// ============================================

// Get user profile
app.get('/api/users/:userId', requireAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { userId: req.params.userId }
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.Item);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user profile
app.put('/api/users/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verify user is updating their own profile
        if (req.session.userInfo.sub !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = req.body;
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { userId },
            UpdateExpression: 'SET ' + Object.keys(updateData).map((key, index) => `${key} = :val${index}`).join(', '),
            ExpressionAttributeValues: Object.keys(updateData).reduce((acc, key, index) => {
                acc[`:val${index}`] = updateData[key];
                return acc;
            }, {}),
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.update(params).promise();
        res.json(result.Attributes);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// ============================================
// EVENT ROUTES
// ============================================

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
        };

        const result = await dynamodb.scan(params).promise();
        res.json(result.Items);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

// Get single event
app.get('/api/events/:eventId', async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { eventId: req.params.eventId }
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result.Item);
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({ error: 'Failed to get event' });
    }
});

// Create new event
app.post('/api/events', requireAuth, async (req, res) => {
    try {
        const eventId = `event_${Date.now()}`;
        const eventData = {
            eventId,
            creatorId: req.session.userInfo.sub,
            createdAt: new Date().toISOString(),
            ...req.body
        };

        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Item: eventData
        };

        await dynamodb.put(params).promise();
        res.status(201).json(eventData);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Update event
app.put('/api/events/:eventId', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // First get the event to verify ownership
        const getParams = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { eventId }
        };
        const eventResult = await dynamodb.get(getParams).promise();

        if (!eventResult.Item || eventResult.Item.creatorId !== req.session.userInfo.sub) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = req.body;
        const updateParams = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { eventId },
            UpdateExpression: 'SET ' + Object.keys(updateData).map((key, index) => `${key} = :val${index}`).join(', '),
            ExpressionAttributeValues: Object.keys(updateData).reduce((acc, key, index) => {
                acc[`:val${index}`] = updateData[key];
                return acc;
            }, {}),
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.update(updateParams).promise();
        res.json(result.Attributes);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event
app.delete('/api/events/:eventId', requireAuth, async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // First get the event to verify ownership
        const getParams = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { eventId }
        };
        const eventResult = await dynamodb.get(getParams).promise();

        if (!eventResult.Item || eventResult.Item.creatorId !== req.session.userInfo.sub) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const deleteParams = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { eventId }
        };

        await dynamodb.delete(deleteParams).promise();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// ============================================
// OPPORTUNITY ROUTES
// ============================================

// Get all opportunities
app.get('/api/opportunities', async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
        };

        const result = await dynamodb.scan(params).promise();
        res.json(result.Items);
    } catch (error) {
        console.error('Error getting opportunities:', error);
        res.status(500).json({ error: 'Failed to get opportunities' });
    }
});

// Get single opportunity
app.get('/api/opportunities/:opportunityId', async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
            Key: { opportunityId: req.params.opportunityId }
        };

        const result = await dynamodb.get(params).promise();

        if (!result.Item) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        res.json(result.Item);
    } catch (error) {
        console.error('Error getting opportunity:', error);
        res.status(500).json({ error: 'Failed to get opportunity' });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function storeUserInDynamoDB(userInfo) {
    try {
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Item: {
                userId: userInfo.sub,
                email: userInfo.email,
                username: userInfo.preferred_username || userInfo.email,
                fullName: userInfo.name,
                phone: userInfo.phone_number,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                avatar: null,
                role: 'user'
            }
        };

        await dynamodb.put(params).promise();
        console.log(`✅ User ${userInfo.email} stored in DynamoDB`);
    } catch (error) {
        console.error('Error storing user in DynamoDB:', error);
    }
}

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.SERVER_PORT || 3000;
const HOST = process.env.SERVER_HOST || 'localhost';

app.listen(PORT, HOST, () => {
    console.log(`\n🚀 EventGo Backend Server Running`);
    console.log(`   URL: http://${HOST}:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Cognito Pool: ${process.env.COGNITO_USER_POOL_ID}`);
    console.log(`   Region: ${process.env.AWS_REGION}\n`);
});

module.exports = app;
