import api from './api';
import type { SearchResults } from '../types';

export const searchService = {
  async search(query: string, type?: string): Promise<SearchResults> {
    const params: Record<string, string> = { q: query };
    if (type) params.type = type;
    const response = await api.get<SearchResults>('/search/', { params });
    return response.data;
  },
};
