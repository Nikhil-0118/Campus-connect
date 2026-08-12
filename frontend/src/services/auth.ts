import api from './api';
import type { User, LoginRequest, LoginResponse, RegisterRequest, Department, Branch } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/accounts/login/', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<{ message: string; user: User }> {
    const response = await api.post('/accounts/register/', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/accounts/me/');
    return response.data;
  },

  async refreshToken(refresh: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/accounts/token/refresh/', { refresh });
    return response.data;
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/accounts/departments/');
    return response.data;
  },

  async getBranches(departmentId?: number): Promise<Branch[]> {
    const params = departmentId ? { department: departmentId } : {};
    const response = await api.get<Branch[]>('/accounts/branches/', { params });
    return response.data;
  },
};
