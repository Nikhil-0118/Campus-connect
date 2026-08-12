import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, MapPin, Calendar } from 'lucide-react';
import { lostFoundService } from '../services/lostFound';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { showToast } from '../utils/toast';

export const LostFoundCreate: React.FC = () => {
  const navigate = useNavigate();

  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast.warning('Item title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('item_type', itemType);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('location', location);
      if (date) formData.append('date', date);
      if (imageFile) formData.append('image', imageFile);

      const res = await lostFoundService.createItem(formData);
      showToast.success('Lost & Found report submitted!');
      navigate(`/lost-found/${res.id}`);
    } catch (err: any) {
      showToast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'electronics', label: 'Electronics (Laptop, Phone, Earbuds)' },
    { value: 'documents', label: 'Documents & IDs (ID Card, Passbook)' },
    { value: 'accessories', label: 'Bags & Accessories' },
    { value: 'clothing', label: 'Clothing & Jackets' },
    { value: 'books', label: 'Books & Notebooks' },
    { value: 'keys', label: 'Keys' },
    { value: 'wallet', label: 'Wallet / Purse' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/lost-found')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Lost or Found Item</h1>
          <p className="text-xs text-gray-500">Provide details to help match missing belongings with owners.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Switcher */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Type of Report
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setItemType('lost')}
                className={`py-3 px-4 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-2
                  ${
                    itemType === 'lost'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                I LOST AN ITEM
              </button>
              <button
                type="button"
                onClick={() => setItemType('found')}
                className={`py-3 px-4 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-2
                  ${
                    itemType === 'found'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                I FOUND AN ITEM
              </button>
            </div>
          </div>

          <Input
            label="Item Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Blue Dell Laptop Backpack with Stickers"
            leftIcon={<Tag className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide identifiable markers, brand names, color, contents..."
              rows={3}
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
              label="Date Lost or Found"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Last Known Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Library 2nd Floor / Computer Lab 3"
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Item Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-teal-200 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/lost-found')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default LostFoundCreate;
