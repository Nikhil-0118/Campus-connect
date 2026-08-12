import api from './api';
import type { Listing, Interest, PaginatedResponse } from '../types';

export const marketplaceService = {
  async createListing(data: FormData): Promise<Listing> {
    const response = await api.post<Listing>('/marketplace/listings/create/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async listListings(params?: Record<string, string | number>): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<PaginatedResponse<Listing>>('/marketplace/listings/', { params });
    return response.data;
  },

  async getListing(id: number): Promise<Listing> {
    const response = await api.get<Listing>(`/marketplace/listings/${id}/`);
    return response.data;
  },

  async updateListing(id: number, data: Partial<Listing>): Promise<Listing> {
    const response = await api.patch<Listing>(`/marketplace/listings/${id}/`, data);
    return response.data;
  },

  async deleteListing(id: number): Promise<void> {
    await api.delete(`/marketplace/listings/${id}/`);
  },

  async markSold(id: number): Promise<void> {
    await api.post(`/marketplace/listings/${id}/mark-sold/`);
  },

  async myListings(params?: Record<string, string | number>): Promise<PaginatedResponse<Listing>> {
    const response = await api.get<PaginatedResponse<Listing>>('/marketplace/my-listings/', { params });
    return response.data;
  },

  async expressInterest(id: number, message: string): Promise<Interest> {
    const response = await api.post<Interest>(`/marketplace/listings/${id}/interest/`, { message });
    return response.data;
  },

  async myInterests(params?: Record<string, string | number>): Promise<PaginatedResponse<Interest>> {
    const response = await api.get<PaginatedResponse<Interest>>('/marketplace/my-interests/', { params });
    return response.data;
  },

  async listingInterests(id: number): Promise<PaginatedResponse<Interest>> {
    const response = await api.get<PaginatedResponse<Interest>>(`/marketplace/listings/${id}/interests/`);
    return response.data;
  },
};
