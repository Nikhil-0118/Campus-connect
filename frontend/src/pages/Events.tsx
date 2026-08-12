import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { eventsService } from '../services/events';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchBar } from '../components/shared/SearchBar';
import { LoadingState } from '../components/shared/LoadingState';
import { Pagination } from '../components/shared/Pagination';
import { showToast } from '../utils/toast';
import type { Event } from '../types';

export const Events: React.FC = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (upcomingOnly) params.upcoming = true;

      const res = await eventsService.listEvents(params);
      setEvents(res.results);
      setHasNext(!!res.next);
      setHasPrevious(!!res.previous);
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, category, upcomingOnly]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRegister = async (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await eventsService.registerForEvent(eventId);
      showToast.success('Registered for event!');
      loadEvents();
    } catch (err) {
      showToast.error(err);
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'hackathon', label: 'Hackathons' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'seminar', label: 'Seminars' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'tech', label: 'Tech Talks' },
    { value: 'club', label: 'Club Meetups' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans text-left pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-normal">Campus Events</h1>
          <p className="text-xs md:text-sm text-gray-500">Discover hackathons, technical workshops, and student meetups.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/events/create')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Event
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar
            onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
            placeholder="Search event title, venue, description..."
          />
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <Select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
            options={categories}
            className="w-full md:w-44"
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer shrink-0 py-2">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => { setUpcomingOnly(e.target.checked); setCurrentPage(1); }}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            Upcoming Only
          </label>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingState count={6} />
      ) : events.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">
          No events found matching your filters.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-gray-300 transition-all h-full"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="primary" size="sm">
                    {event.category.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{event.registration_count} Registered</span>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{event.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500 mt-auto">
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {event.venue}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => handleRegister(event.id, e)}
                >
                  Register
                </Button>
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
export default Events;
