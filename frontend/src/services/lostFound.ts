import api from './api';
import type { LostFoundItem, LostFoundMatch, PaginatedResponse } from '../types';

export const lostFoundService = {
  async createItem(data: FormData): Promise<LostFoundItem> {
    const response = await api.post<LostFoundItem>('/lost-found/create/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async listItems(params?: Record<string, string | number>): Promise<PaginatedResponse<LostFoundItem>> {
    const response = await api.get<PaginatedResponse<LostFoundItem>>('/lost-found/', { params });
    return response.data;
  },

  async getItem(id: number): Promise<LostFoundItem> {
    const response = await api.get<LostFoundItem>(`/lost-found/${id}/`);
    return response.data;
  },

  async updateItem(id: number, data: Partial<LostFoundItem>): Promise<LostFoundItem> {
    const response = await api.patch<LostFoundItem>(`/lost-found/${id}/`, data);
    return response.data;
  },

  async deleteItem(id: number): Promise<void> {
    await api.delete(`/lost-found/${id}/`);
  },

  async resolveItem(id: number): Promise<void> {
    await api.post(`/lost-found/${id}/resolve/`);
  },

  async myItems(params?: Record<string, string | number>): Promise<PaginatedResponse<LostFoundItem>> {
    const response = await api.get<PaginatedResponse<LostFoundItem>>('/lost-found/my/', { params });
    return response.data;
  },

  async getMatches(id: number): Promise<LostFoundMatch[]> {
    const response = await api.get<LostFoundMatch[]>(`/lost-found/${id}/matches/`);
    return response.data;
  },
};
