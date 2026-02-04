// AWS DynamoDB Integration
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

// Initialize DynamoDB Client
const dynamoClient = new DynamoDBClient({ 
  region: AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  }
});

// Document client for easier operations
export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

// Table names
export const TABLES = {
  USERS: import.meta.env.VITE_AWS_DYNAMODB_USERS_TABLE || 'Datta-Evntgo-Datta-2005-users',
  EVENTS: import.meta.env.VITE_AWS_DYNAMODB_EVENTS_TABLE || 'Datta-Evntgo-Datta-2005-events',
  OPPORTUNITIES: import.meta.env.VITE_AWS_DYNAMODB_OPPORTUNITIES_TABLE || 'Datta-Evntgo-Datta-2005-opportunities',
};

// Type definitions
export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'college' | 'company';
  collegeId?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  eventId: string;
  title: string;
  description?: string;
  college?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  oppId: string;
  title: string;
  type: 'job' | 'internship';
  description?: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// User Operations
export const userService = {
  async createUser(user: User) {
    try {
      const command = new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      await docClient.send(command);
      return { success: true, data: user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error };
    }
  },

  async getUser(userId: string) {
    try {
      const command = new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId },
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Item };
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error };
    }
  },

  async getUserByEmail(email: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'email-index', // Requires GSI on email
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Items?.[0] };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return { success: false, error };
    }
  },

  async updateUser(userId: string, updates: Partial<User>) {
    try {
      const command = new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: 'SET #updated = :now, ' + 
          Object.keys(updates).map(key => `#${key} = :${key}`).join(', '),
        ExpressionAttributeNames: {
          '#updated': 'updatedAt',
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        },
        ExpressionAttributeValues: {
          ':now': new Date().toISOString(),
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key as keyof User] }), {}),
        },
        ReturnValues: 'ALL_NEW',
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Attributes };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
  },
};

// Event Operations
export const eventService = {
  async createEvent(event: Event) {
    try {
      const command = new PutCommand({
        TableName: TABLES.EVENTS,
        Item: {
          ...event,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      await docClient.send(command);
      return { success: true, data: event };
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, error };
    }
  },

  async getEvent(eventId: string) {
    try {
      const command = new GetCommand({
        TableName: TABLES.EVENTS,
        Key: { eventId },
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Item };
    } catch (error) {
      console.error('Error getting event:', error);
      return { success: false, error };
    }
  },

  async getEventsByCreator(createdBy: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.EVENTS,
        IndexName: 'createdBy-index', // Requires GSI on createdBy
        KeyConditionExpression: 'createdBy = :userId',
        ExpressionAttributeValues: { ':userId': createdBy },
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error('Error getting events:', error);
      return { success: false, error };
    }
  },

  async updateEvent(eventId: string, updates: Partial<Event>) {
    try {
      const command = new UpdateCommand({
        TableName: TABLES.EVENTS,
        Key: { eventId },
        UpdateExpression: 'SET #updated = :now, ' + 
          Object.keys(updates).map(key => `#${key} = :${key}`).join(', '),
        ExpressionAttributeNames: {
          '#updated': 'updatedAt',
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        },
        ExpressionAttributeValues: {
          ':now': new Date().toISOString(),
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key as keyof Event] }), {}),
        },
        ReturnValues: 'ALL_NEW',
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Attributes };
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error };
    }
  },

  async deleteEvent(eventId: string) {
    try {
      const command = new DeleteCommand({
        TableName: TABLES.EVENTS,
        Key: { eventId },
      });
      await docClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error };
    }
  },
};

// Opportunity Operations
export const opportunityService = {
  async createOpportunity(opportunity: Opportunity) {
    try {
      const command = new PutCommand({
        TableName: TABLES.OPPORTUNITIES,
        Item: {
          ...opportunity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
      await docClient.send(command);
      return { success: true, data: opportunity };
    } catch (error) {
      console.error('Error creating opportunity:', error);
      return { success: false, error };
    }
  },

  async getOpportunity(oppId: string) {
    try {
      const command = new GetCommand({
        TableName: TABLES.OPPORTUNITIES,
        Key: { oppId },
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Item };
    } catch (error) {
      console.error('Error getting opportunity:', error);
      return { success: false, error };
    }
  },

  async getOpportunitiesByType(type: 'job' | 'internship') {
    try {
      const command = new ScanCommand({
        TableName: TABLES.OPPORTUNITIES,
        FilterExpression: '#type = :type',
        ExpressionAttributeNames: { '#type': 'type' },
        ExpressionAttributeValues: { ':type': type },
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Items || [] };
    } catch (error) {
      console.error('Error getting opportunities:', error);
      return { success: false, error };
    }
  },

  async updateOpportunity(oppId: string, updates: Partial<Opportunity>) {
    try {
      const command = new UpdateCommand({
        TableName: TABLES.OPPORTUNITIES,
        Key: { oppId },
        UpdateExpression: 'SET #updated = :now, ' + 
          Object.keys(updates).map(key => `#${key} = :${key}`).join(', '),
        ExpressionAttributeNames: {
          '#updated': 'updatedAt',
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        },
        ExpressionAttributeValues: {
          ':now': new Date().toISOString(),
          ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [`:${key}`]: updates[key as keyof Opportunity] }), {}),
        },
        ReturnValues: 'ALL_NEW',
      });
      const result = await docClient.send(command);
      return { success: true, data: result.Attributes };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      return { success: false, error };
    }
  },

  async deleteOpportunity(oppId: string) {
    try {
      const command = new DeleteCommand({
        TableName: TABLES.OPPORTUNITIES,
        Key: { oppId },
      });
      await docClient.send(command);
      return { success: true };
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      return { success: false, error };
    }
  },
};
