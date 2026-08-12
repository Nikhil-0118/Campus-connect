import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../ui/Input';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
  delay?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  initialValue = '',
  delay = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);
  const debouncedSearch = useDebounce<string>(searchTerm, delay);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="w-full">
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="w-4 h-4" />}
      />
    </div>
  );
};
export default SearchBar;
