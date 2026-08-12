import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Tag, Link as LinkIcon } from 'lucide-react';
import { eventsService } from '../services/events';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { showToast } from '../utils/toast';

export const EventCreate: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [registrationLink, setRegistrationLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !venue) {
      showToast.warning('Title, Date, Start Time, and Venue are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('venue', venue);
      formData.append('date', date);
      formData.append('start_time', startTime);
      if (endTime) formData.append('end_time', endTime);
      formData.append('category', category);
      if (registrationLink) formData.append('registration_link', registrationLink);
      if (imageFile) formData.append('image', imageFile);

      const res = await eventsService.createEvent(formData);
      showToast.success('Event published successfully!');
      navigate(`/events/${res.id}`);
    } catch (err: any) {
      showToast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'cultural', label: 'Cultural Fest' },
    { value: 'sports', label: 'Sports Meet' },
    { value: 'tech', label: 'Tech Talk' },
    { value: 'club', label: 'Club Activity' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/events')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Publish Campus Event</h1>
          <p className="text-xs text-gray-500">Promote your club activities, hackathons, or seminars.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Event Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Smart Campus Hackathon 2026"
            leftIcon={<Tag className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, schedule, prerequisites, or eligibility..."
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
            />

            <Input
              label="Venue / Room"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Main Auditorium / Seminar Hall B"
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Event Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Start Time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />

            <Input
              label="End Time (Optional)"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <Input
            label="External Registration / Information Link (Optional)"
            type="url"
            value={registrationLink}
            onChange={(e) => setRegistrationLink(e.target.value)}
            placeholder="https://..."
            leftIcon={<LinkIcon className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Banner Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-teal-200 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/events')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Publish Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default EventCreate;
