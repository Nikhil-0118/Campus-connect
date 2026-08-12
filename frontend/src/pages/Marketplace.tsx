import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { marketplaceService } from '../services/marketplace';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchBar } from '../components/shared/SearchBar';
import { LoadingState } from '../components/shared/LoadingState';
import { Pagination } from '../components/shared/Pagination';
import { showToast } from '../utils/toast';
import type { Listing } from '../types';

export const Marketplace: React.FC = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (condition) params.condition = condition;

      const res = await marketplaceService.listListings(params);
      setListings(res.results);
      setHasNext(!!res.next);
      setHasPrevious(!!res.previous);
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, category, condition]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'books', label: 'Books' },
    { value: 'notes', label: 'Notes' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'calculators', label: 'Calculators' },
    { value: 'lab_equipment', label: 'Lab Equipment' },
    { value: 'college_materials', label: 'College Essentials' },
    { value: 'other', label: 'Other' },
  ];

  const conditions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans text-left pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-normal">Campus Marketplace</h1>
          <p className="text-xs md:text-sm text-gray-500">Buy and sell textbooks, notes, lab gear, and accessories.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/marketplace/create')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Sell Something
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar
            onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
            placeholder="Search items, textbooks, calculators..."
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
            options={categories}
            className="w-full md:w-44"
          />
          <Select
            value={condition}
            onChange={(e) => { setCondition(e.target.value); setCurrentPage(1); }}
            options={conditions}
            className="w-full md:w-36"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingState count={6} />
      ) : listings.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">
          No listings found. Be the first to sell something on campus!
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/marketplace/${item.id}`)}
              className="flex flex-col justify-between hover:border-gray-300 transition-all h-full cursor-pointer"
            >
              <div>
                <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={
                        item.image.startsWith('http')
                          ? item.image
                          : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${item.image}`
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge size="sm" variant={item.status === 'available' ? 'success' : 'gray'}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</h3>
                    <span className="text-sm font-bold text-primary shrink-0">₹{item.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="px-4 pb-4 border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] text-gray-400 mt-auto">
                <span>{item.location || 'Campus'}</span>
                <span className="capitalize">{item.condition.replace('_', ' ')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};
export default Marketplace;
