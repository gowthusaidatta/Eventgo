require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AWS Configuration
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// In-memory user store for development (fallback when DynamoDB fails)
const inMemoryUsers = new Map();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
            req.isAuthenticated = true;
        } catch (error) {
            req.isAuthenticated = false;
        }
    } else {
        req.isAuthenticated = false;
    }
    next();
};

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. Please login first.' });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getUserByEmail(email) {
    try {
        // Try DynamoDB first
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            IndexName: 'email-index', // You'll need to create this GSI
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };
        const result = await dynamodb.query(params).promise();
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (dynamoError) {
        console.error('DynamoDB fetch failed, checking in-memory store:', dynamoError.code);
        // Fallback to in-memory store
        for (const user of inMemoryUsers.values()) {
            if (user.email === email) return user;
        }
        return null;
    }
}

async function createUser(email, password, fullName, role) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();
        
        const user = {
            id: userId,
            email,
            password: hashedPassword,
            full_name: fullName,
            role: role || 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            // Try DynamoDB first
            const params = {
                TableName: process.env.DYNAMODB_USERS_TABLE,
                Item: user
            };
            await dynamodb.put(params).promise();
            console.log('User created in DynamoDB:', email);
        } catch (dynamoError) {
            // Fallback to in-memory store
            console.warn('DynamoDB write failed, storing in-memory:', dynamoError.code);
            inMemoryUsers.set(user.id, user);
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to EventGo Backend',
        authenticated: false
    });
});

// Sign up
app.post('/auth/signup', async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // Validation
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Email, password, and full name are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        // Check if user exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered.' });
        }

        // Create user
        const user = await createUser(email, password, full_name, role);

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.status(201).json({
            user,
            token,
            authenticated: true
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed.' });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            user: userWithoutPassword,
            token,
            authenticated: true
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Get current user
app.get('/auth/user', checkAuth, (req, res) => {
    if (req.isAuthenticated) {
        res.json({
            user: req.user,
            authenticated: true
        });
    } else {
        res.json({
            user: null,
            authenticated: false
        });
    }
});

// Logout (stateless - just return success)
app.get('/auth/logout', (req, res) => {
    res.json({
        message: 'Logged out successfully',
        authenticated: false
    });
});

// ============================================
// USER ROUTES
// ============================================

app.get('/api/users/:userId', requireAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { id: req.params.userId }
        };

        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const { password: _, ...userWithoutPassword } = result.Item;
        res.json({
            user: userWithoutPassword,
            role: result.Item.role
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user.' });
    }
});

app.put('/api/users/:userId', requireAuth, async (req, res) => {
    try {
        const { full_name, phone, college_name, graduation_year } = req.body;

        const updateExpression = ['#updated_at = :updated_at'];
        const expressionAttributeNames = { '#updated_at': 'updated_at' };
        const expressionAttributeValues = { ':updated_at': new Date().toISOString() };

        if (full_name) {
            updateExpression.push('#full_name = :full_name');
            expressionAttributeNames['#full_name'] = 'full_name';
            expressionAttributeValues[':full_name'] = full_name;
        }
        if (phone) {
            updateExpression.push('phone = :phone');
            expressionAttributeValues[':phone'] = phone;
        }
        if (college_name) {
            updateExpression.push('college_name = :college_name');
            expressionAttributeValues[':college_name'] = college_name;
        }
        if (graduation_year) {
            updateExpression.push('graduation_year = :graduation_year');
            expressionAttributeValues[':graduation_year'] = graduation_year;
        }

        const params = {
            TableName: process.env.DYNAMODB_USERS_TABLE,
            Key: { id: req.params.userId },
            UpdateExpression: updateExpression.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.update(params).promise();
        const { password: _, ...userWithoutPassword } = result.Attributes;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

// ============================================
// EVENTS ROUTES
// ============================================

app.get('/api/events', checkAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE
        };

        const result = await dynamodb.scan(params).promise();
        res.json(result.Items || []);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events.' });
    }
});

app.get('/api/events/:id', checkAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { id: req.params.id }
        };

        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        res.json(result.Item);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event.' });
    }
});

app.post('/api/events', requireAuth, async (req, res) => {
    try {
        const { title, description, date, location, image_url } = req.body;

        const event = {
            id: crypto.randomUUID(),
            title,
            description,
            date,
            location,
            image_url,
            created_by: req.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Item: event
        };

        await dynamodb.put(params).promise();
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event.' });
    }
});

app.put('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const { title, description, date, location, image_url } = req.body;

        const updateExpression = ['updated_at = :updated_at'];
        const expressionAttributeValues = { ':updated_at': new Date().toISOString() };

        if (title) {
            updateExpression.push('title = :title');
            expressionAttributeValues[':title'] = title;
        }
        if (description) {
            updateExpression.push('description = :description');
            expressionAttributeValues[':description'] = description;
        }
        if (date) {
            updateExpression.push('#date = :date');
            expressionAttributeValues[':date'] = date;
        }
        if (location) {
            updateExpression.push('location = :location');
            expressionAttributeValues[':location'] = location;
        }
        if (image_url) {
            updateExpression.push('image_url = :image_url');
            expressionAttributeValues[':image_url'] = image_url;
        }

        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { id: req.params.id },
            UpdateExpression: updateExpression.join(', '),
            ExpressionAttributeNames: { '#date': 'date' },
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamodb.update(params).promise();
        res.json(result.Attributes);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event.' });
    }
});

app.delete('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_EVENTS_TABLE,
            Key: { id: req.params.id }
        };

        await dynamodb.delete(params).promise();
        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event.' });
    }
});

// ============================================
// OPPORTUNITIES ROUTES
// ============================================

app.get('/api/opportunities', checkAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE
        };

        const result = await dynamodb.scan(params).promise();
        res.json(result.Items || []);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ error: 'Failed to fetch opportunities.' });
    }
});

app.get('/api/opportunities/:id', checkAuth, async (req, res) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
            Key: { id: req.params.id }
        };

        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
            return res.status(404).json({ error: 'Opportunity not found.' });
        }

        res.json(result.Item);
    } catch (error) {
        console.error('Error fetching opportunity:', error);
        res.status(500).json({ error: 'Failed to fetch opportunity.' });
    }
});

app.post('/api/opportunities', requireAuth, async (req, res) => {
    try {
        const { title, description, type, company, salary_range } = req.body;

        const opportunity = {
            id: crypto.randomUUID(),
            title,
            description,
            type,
            company,
            salary_range,
            posted_by: req.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const params = {
            TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
            Item: opportunity
        };

        await dynamodb.put(params).promise();
        res.status(201).json(opportunity);
    } catch (error) {
        console.error('Error creating opportunity:', error);
        res.status(500).json({ error: 'Failed to create opportunity.' });
    }
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
    console.log('\n🚀 EventGo Backend Server Running');
    console.log(`   URL: http://0.0.0.0:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database: DynamoDB (${process.env.AWS_REGION})`);
    console.log(`   Auth: JWT\n`);
});

module.exports = app;
