import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import { lostFoundService } from '../services/lostFound';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchBar } from '../components/shared/SearchBar';
import { LoadingState } from '../components/shared/LoadingState';
import { Pagination } from '../components/shared/Pagination';
import { showToast } from '../utils/toast';
import type { LostFoundItem } from '../types';

export const LostFound: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [itemType, setItemType] = useState<string>(''); // 'lost', 'found', or ''
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
      };
      if (search) params.search = search;
      if (itemType) params.item_type = itemType;
      if (category) params.category = category;

      const res = await lostFoundService.listItems(params);
      setItems(res.results);
      setHasNext(!!res.next);
      setHasPrevious(!!res.previous);
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, itemType, category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'documents', label: 'Documents & IDs' },
    { value: 'accessories', label: 'Bags & Accessories' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books & Notes' },
    { value: 'keys', label: 'Keys' },
    { value: 'wallet', label: 'Wallet / Purse' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans text-left pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-normal">Lost & Found</h1>
          <p className="text-xs md:text-sm text-gray-500">Report missing belongings or help return found items on campus.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/lost-found/create')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Report Item
        </Button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Toggle Lost / Found / All */}
        <div className="inline-flex rounded-md bg-gray-150 p-1 shrink-0 w-full md:w-auto">
          <button
            onClick={() => { setItemType(''); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex-1 md:flex-none
              ${itemType === '' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All Items
          </button>
          <button
            onClick={() => { setItemType('lost'); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex-1 md:flex-none
              ${itemType === 'lost' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            LOST
          </button>
          <button
            onClick={() => { setItemType('found'); setCurrentPage(1); }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex-1 md:flex-none
              ${itemType === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            FOUND
          </button>
        </div>

        <div className="flex-1 w-full">
          <SearchBar
            onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
            placeholder="Search lost or found items, locations, titles..."
          />
        </div>

        <Select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
          options={categories}
          className="w-full md:w-44"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingState count={6} />
      ) : items.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">
          No lost or found posts matching your filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              onClick={() => navigate(`/lost-found/${item.id}`)}
              className="p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-gray-300 transition-all h-full"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={item.item_type === 'lost' ? 'error' : 'success'}>
                    {item.item_type.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500 mt-auto">
                <span className="flex items-center gap-1 truncate max-w-[160px]">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {item.location || 'Campus'}
                </span>
                <Badge size="sm" variant={item.status === 'active' ? 'primary' : 'gray'}>
                  {item.status.toUpperCase()}
                </Badge>
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
export default LostFound;
