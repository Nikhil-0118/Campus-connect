import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Trash2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventsService } from '../services/events';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/shared/LoadingState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { showToast } from '../utils/toast';
import type { Event } from '../types';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchEventData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await eventsService.getEvent(Number(id));
      setEvent(data);

      // Check if user is already registered
      const regs = await eventsService.myRegistrations();
      const registered = regs.results.some((r) => r.event === Number(id));
      setIsRegistered(registered);
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  if (isLoading) return <LoadingState type="page" />;
  if (!event) return <Card className="p-6 text-center text-gray-500">Event not found.</Card>;

  const isOrganizer = user?.id === event.organizer;

  const handleRegister = async () => {
    setIsActionLoading(true);
    try {
      await eventsService.registerForEvent(event.id);
      showToast.success('Successfully registered for event!');
      setIsRegistered(true);
      await fetchEventData();
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await eventsService.deleteEvent(event.id);
      showToast.success('Event deleted.');
      setShowDeleteDialog(false);
      navigate('/events');
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/events')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {isOrganizer && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Event
          </Button>
        )}
      </div>

      {/* Event Details Card */}
      <Card className="p-6 md:p-8 flex flex-col gap-6">
        {/* Banner image */}
        {event.image && (
          <div className="w-full aspect-video md:aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={
                event.image.startsWith('http')
                  ? event.image
                  : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${event.image}`
              }
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <Badge variant="primary" size="md">
              {event.category.toUpperCase()}
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{event.title}</h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              Organized by <strong className="text-gray-700">@{event.organizer_detail?.username}</strong>
            </p>
          </div>

          <div>
            {isRegistered ? (
              <Button variant="outline" size="md" disabled leftIcon={<Check className="w-4 h-4" />}>
                Registered
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleRegister}
                isLoading={isActionLoading}
              >
                Register Now
              </Button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Date</span>
              <strong className="text-gray-900">{new Date(event.date).toLocaleDateString()}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Time</span>
              <strong className="text-gray-900">
                {event.start_time} {event.end_time ? `- ${event.end_time}` : ''}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Venue</span>
              <strong className="text-gray-900">{event.venue}</strong>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">About Event</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* External Registration Link */}
        {event.registration_link && (
          <div>
            <a
              href={event.registration_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-dark underline"
            >
              External Registration / Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event permanently?"
        confirmText="Delete"
        isDanger
        isLoading={isActionLoading}
      />
    </div>
  );
};
export default EventDetail;
