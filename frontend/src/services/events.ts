import api from './api';
import type { Event, EventRegistration, PaginatedResponse } from '../types';

export const eventsService = {
  async createEvent(data: FormData): Promise<Event> {
    const response = await api.post<Event>('/events/create/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async listEvents(params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Event>> {
    const response = await api.get<PaginatedResponse<Event>>('/events/', { params });
    return response.data;
  },

  async getEvent(id: number): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}/`);
    return response.data;
  },

  async updateEvent(id: number, data: Partial<Event>): Promise<Event> {
    const response = await api.patch<Event>(`/events/${id}/`, data);
    return response.data;
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/events/${id}/`);
  },

  async registerForEvent(id: number): Promise<void> {
    await api.post(`/events/${id}/register/`);
  },

  async myRegistrations(params?: Record<string, string | number>): Promise<PaginatedResponse<EventRegistration>> {
    const response = await api.get<PaginatedResponse<EventRegistration>>('/events/my-registrations/', { params });
    return response.data;
  },
};
