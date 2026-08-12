import api from './api';
import type { Team, PaginatedResponse } from '../types';

export const teamsService = {
  async createTeam(data: {
    name: string;
    description?: string;
    project_description?: string;
    required_skills?: string[];
    max_members?: number;
    hackathon_name?: string;
  }): Promise<Team> {
    const response = await api.post<Team>('/teams/create/', data);
    return response.data;
  },

  async listTeams(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Team>> {
    const response = await api.get<PaginatedResponse<Team>>('/teams/', { params });
    return response.data;
  },

  async getTeam(id: number): Promise<Team> {
    const response = await api.get<Team>(`/teams/${id}/`);
    return response.data;
  },

  async updateTeam(id: number, data: Partial<Team>): Promise<Team> {
    const response = await api.patch<Team>(`/teams/${id}/`, data);
    return response.data;
  },

  async deleteTeam(id: number): Promise<void> {
    await api.delete(`/teams/${id}/`);
  },

  async joinTeam(id: number): Promise<void> {
    await api.post(`/teams/${id}/join/`);
  },

  async leaveTeam(id: number): Promise<void> {
    await api.post(`/teams/${id}/leave/`);
  },

  async myTeams(params?: Record<string, string | number>): Promise<PaginatedResponse<Team>> {
    const response = await api.get<PaginatedResponse<Team>>('/teams/my/', { params });
    return response.data;
  },
};
