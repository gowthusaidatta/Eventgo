// AWS RDS Database Service (PostgreSQL)
import { rdsConfig } from './config';

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface User {
  id: string;
  cognitoUserId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  collegeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface College {
  id: string;
  name: string;
  location?: string;
  logoUrl?: string;
  website?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  collegeId?: string;
  imageUrl?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  title: string;
  type: string;
  description?: string;
  companyName?: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get RDS connection string
export const getRDSConnectionString = (): string => {
  return `postgresql://${rdsConfig.user}:${rdsConfig.password}@${rdsConfig.host}:${rdsConfig.port}/${rdsConfig.database}`;
};

// Database operations would be implemented on the backend API
// The frontend would call API endpoints that interact with RDS

export const dbApi = {
  // User operations
  createUser: async (user: Partial<User>) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  },

  getUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // College operations
  getColleges: async () => {
    const response = await fetch('/api/colleges');
    return response.json();
  },

  getCollege: async (collegeId: string) => {
    const response = await fetch(`/api/colleges/${collegeId}`);
    return response.json();
  },

  // Event operations
  getEvents: async () => {
    const response = await fetch('/api/events');
    return response.json();
  },

  getEvent: async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}`);
    return response.json();
  },

  createEvent: async (event: Partial<Event>) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return response.json();
  },

  // Opportunity operations
  getOpportunities: async (type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    const response = await fetch(`/api/opportunities?${params}`);
    return response.json();
  },

  getOpportunity: async (opportunityId: string) => {
    const response = await fetch(`/api/opportunities/${opportunityId}`);
    return response.json();
  },

  createOpportunity: async (opportunity: Partial<Opportunity>) => {
    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity),
    });
    return response.json();
  },
};
