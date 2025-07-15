import { api } from './api';

export interface User {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: string;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  roles: string[];
  isOrganizer: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  organizationName?: string;
  website?: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export const adminService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/Admin/users');
    return response.data as User[];
  },

  // Create new admin user
  createAdmin: async (userData: CreateUserRequest): Promise<any> => {
    const response = await api.post('/Admin/create-admin', userData);
    return response.data;
  },

  // Create new organizer user
  createOrganizer: async (userData: CreateUserRequest): Promise<any> => {
    const response = await api.post('/Admin/create-organizer', userData);
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (resetData: ResetPasswordRequest): Promise<any> => {
    const response = await api.post('/Admin/reset-user-password', resetData);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<any> => {
    const response = await api.get('/Admin/dashboard-stats');
    return response.data;
  },

  // Get all organizers
  getAllOrganizers: async (verified?: boolean): Promise<any[]> => {
    const params = verified !== undefined ? { verified } : {};
    const response = await api.get('/Admin/organizers', { params });
    return response.data as any[];
  },

  // Verify organizer
  verifyOrganizer: async (id: number, notes?: string): Promise<any> => {
    const response = await api.put(`/Admin/organizers/${id}/verify`, { notes });
    return response.data as any;
  },

  // Unverify organizer
  unverifyOrganizer: async (id: number): Promise<any> => {
    const response = await api.put(`/Admin/organizers/${id}/unverify`);
    return response.data as any;
  },

  // Get all events
  getAllEvents: async (active?: boolean): Promise<any[]> => {
    const params = active !== undefined ? { active } : {};
    const response = await api.get('/Admin/events', { params });
    return response.data as any[];
  },

  // Toggle event status
  toggleEventStatus: async (id: number): Promise<any> => {
    const response = await api.put(`/Admin/events/${id}/toggle-status`);
    return response.data as any;
  }
};
