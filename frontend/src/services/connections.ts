import api from './api';
import type { Connection, PaginatedResponse } from '../types';

export const connectionsService = {
  async sendRequest(userId: number): Promise<Connection> {
    const response = await api.post<Connection>(`/connections/${userId}/send/`);
    return response.data;
  },

  async acceptRequest(userId: number): Promise<Connection> {
    const response = await api.post<Connection>(`/connections/${userId}/accept/`);
    return response.data;
  },

  async rejectRequest(userId: number): Promise<Connection> {
    const response = await api.post<Connection>(`/connections/${userId}/reject/`);
    return response.data;
  },

  async listConnections(params?: Record<string, string | number>): Promise<PaginatedResponse<Connection>> {
    const response = await api.get<PaginatedResponse<Connection>>('/connections/', { params });
    return response.data;
  },

  async listRequests(params?: Record<string, string | number>): Promise<PaginatedResponse<Connection>> {
    const response = await api.get<PaginatedResponse<Connection>>('/connections/requests/', { params });
    return response.data;
  },
};
