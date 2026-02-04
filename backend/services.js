const AWS = require('aws-sdk');

// AWS Configuration
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// ============================================
// USER OPERATIONS
// ============================================

const userService = {
    // Create or update user in DynamoDB
    async upsertUser(userInfo) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_USERS_TABLE,
                Item: {
                    userId: userInfo.sub,
                    email: userInfo.email,
                    username: userInfo.preferred_username || userInfo.email,
                    fullName: userInfo.name,
                    phone: userInfo.phone_number,
                    avatar: userInfo.picture || null,
                    role: 'user',
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    ...userInfo
                }
            };

            await dynamodb.put(params).promise();
            console.log(`✅ User ${userInfo.email} upserted successfully`);
            return params.Item;
        } catch (error) {
            console.error('Error upserting user:', error);
            throw error;
        }
    },

    // Get user by ID
    async getUserById(userId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_USERS_TABLE,
                Key: { userId }
            };

            const result = await dynamodb.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    },

    // Get user by email
    async getUserByEmail(email) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_USERS_TABLE,
                FilterExpression: 'email = :email',
                ExpressionAttributeValues: { ':email': email }
            };

            const result = await dynamodb.scan(params).promise();
            return result.Items?.[0] || null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    },

    // Update user
    async updateUser(userId, updateData) {
        try {
            const updateExpression = 'SET ' + Object.keys(updateData)
                .map((key, index) => `${key} = :val${index}`)
                .join(', ');

            const expressionAttributeValues = Object.keys(updateData).reduce((acc, key, index) => {
                acc[`:val${index}`] = updateData[key];
                return acc;
            }, {});

            const params = {
                TableName: process.env.DYNAMODB_USERS_TABLE,
                Key: { userId },
                UpdateExpression: updateExpression + ', updatedAt = :now',
                ExpressionAttributeValues: {
                    ...expressionAttributeValues,
                    ':now': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Delete user
    async deleteUser(userId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_USERS_TABLE,
                Key: { userId }
            };

            await dynamodb.delete(params).promise();
            console.log(`✅ User ${userId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

// ============================================
// EVENT OPERATIONS
// ============================================

const eventService = {
    // Create event
    async createEvent(eventData, creatorId) {
        try {
            const eventId = `event_${Date.now()}`;
            const params = {
                TableName: process.env.DYNAMODB_EVENTS_TABLE,
                Item: {
                    eventId,
                    creatorId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'active',
                    ...eventData
                }
            };

            await dynamodb.put(params).promise();
            console.log(`✅ Event ${eventId} created successfully`);
            return params.Item;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    // Get event by ID
    async getEventById(eventId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_EVENTS_TABLE,
                Key: { eventId }
            };

            const result = await dynamodb.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error('Error getting event:', error);
            throw error;
        }
    },

    // Get events by creator
    async getEventsByCreator(creatorId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_EVENTS_TABLE,
                FilterExpression: 'creatorId = :creatorId',
                ExpressionAttributeValues: { ':creatorId': creatorId }
            };

            const result = await dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error getting events by creator:', error);
            throw error;
        }
    },

    // Get all events
    async getAllEvents() {
        try {
            const params = {
                TableName: process.env.DYNAMODB_EVENTS_TABLE
            };

            const result = await dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error getting all events:', error);
            throw error;
        }
    },

    // Update event
    async updateEvent(eventId, updateData) {
        try {
            const updateExpression = 'SET ' + Object.keys(updateData)
                .map((key, index) => `${key} = :val${index}`)
                .join(', ');

            const expressionAttributeValues = Object.keys(updateData).reduce((acc, key, index) => {
                acc[`:val${index}`] = updateData[key];
                return acc;
            }, {});

            const params = {
                TableName: process.env.DYNAMODB_EVENTS_TABLE,
                Key: { eventId },
                UpdateExpression: updateExpression + ', updatedAt = :now',
                ExpressionAttributeValues: {
                    ...expressionAttributeValues,
                    ':now': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    // Delete event
    async deleteEvent(eventId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_EVENTS_TABLE,
                Key: { eventId }
            };

            await dynamodb.delete(params).promise();
            console.log(`✅ Event ${eventId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
};

// ============================================
// OPPORTUNITY OPERATIONS
// ============================================

const opportunityService = {
    // Create opportunity
    async createOpportunity(opportunityData, creatorId) {
        try {
            const opportunityId = `opp_${Date.now()}`;
            const params = {
                TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
                Item: {
                    opportunityId,
                    creatorId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'active',
                    ...opportunityData
                }
            };

            await dynamodb.put(params).promise();
            console.log(`✅ Opportunity ${opportunityId} created successfully`);
            return params.Item;
        } catch (error) {
            console.error('Error creating opportunity:', error);
            throw error;
        }
    },

    // Get opportunity by ID
    async getOpportunityById(opportunityId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
                Key: { opportunityId }
            };

            const result = await dynamodb.get(params).promise();
            return result.Item || null;
        } catch (error) {
            console.error('Error getting opportunity:', error);
            throw error;
        }
    },

    // Get opportunities by type
    async getOpportunitiesByType(type) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
                FilterExpression: 'opportunityType = :type',
                ExpressionAttributeValues: { ':type': type }
            };

            const result = await dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error getting opportunities by type:', error);
            throw error;
        }
    },

    // Get all opportunities
    async getAllOpportunities() {
        try {
            const params = {
                TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE
            };

            const result = await dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Error getting all opportunities:', error);
            throw error;
        }
    },

    // Update opportunity
    async updateOpportunity(opportunityId, updateData) {
        try {
            const updateExpression = 'SET ' + Object.keys(updateData)
                .map((key, index) => `${key} = :val${index}`)
                .join(', ');

            const expressionAttributeValues = Object.keys(updateData).reduce((acc, key, index) => {
                acc[`:val${index}`] = updateData[key];
                return acc;
            }, {});

            const params = {
                TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
                Key: { opportunityId },
                UpdateExpression: updateExpression + ', updatedAt = :now',
                ExpressionAttributeValues: {
                    ...expressionAttributeValues,
                    ':now': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error updating opportunity:', error);
            throw error;
        }
    },

    // Delete opportunity
    async deleteOpportunity(opportunityId) {
        try {
            const params = {
                TableName: process.env.DYNAMODB_OPPORTUNITIES_TABLE,
                Key: { opportunityId }
            };

            await dynamodb.delete(params).promise();
            console.log(`✅ Opportunity ${opportunityId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting opportunity:', error);
            throw error;
        }
    }
};

// ============================================
// S3 FILE OPERATIONS
// ============================================

const fileService = {
    // Upload file to S3
    async uploadFile(file, folder = 'uploads') {
        try {
            const key = `${folder}/${Date.now()}-${file.originalname}`;
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read'
            };

            const result = await s3.upload(params).promise();
            console.log(`✅ File uploaded to S3: ${key}`);
            return {
                url: result.Location,
                key: result.Key,
                bucket: result.Bucket
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    // Get signed download URL
    async getSignedUrl(key, expirationSeconds = 3600) {
        try {
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key,
                Expires: expirationSeconds
            };

            const url = await s3.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.error('Error getting signed URL:', error);
            throw error;
        }
    },

    // Delete file from S3
    async deleteFile(key) {
        try {
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: key
            };

            await s3.deleteObject(params).promise();
            console.log(`✅ File deleted from S3: ${key}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};

module.exports = {
    userService,
    eventService,
    opportunityService,
    fileService,
    dynamodb,
    s3
};
