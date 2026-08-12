import api from './api';
import type { Profile, PaginatedResponse } from '../types';

export const profilesService = {
  async getMyProfile(): Promise<Profile> {
    const response = await api.get<Profile>('/profiles/me/');
    return response.data;
  },

  async updateMyProfile(data: Partial<Pick<Profile, 'skills' | 'interests' | 'social_links'>>): Promise<Profile> {
    const response = await api.patch<Profile>('/profiles/me/', data);
    return response.data;
  },

  async listProfiles(params?: Record<string, string | number>): Promise<PaginatedResponse<Profile>> {
    const response = await api.get<PaginatedResponse<Profile>>('/profiles/', { params });
    return response.data;
  },

  async getProfile(id: number): Promise<Profile> {
    const response = await api.get<Profile>(`/profiles/${id}/`);
    return response.data;
  },
};
