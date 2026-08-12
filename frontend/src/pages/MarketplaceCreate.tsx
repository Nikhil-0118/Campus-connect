import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, DollarSign, MapPin } from 'lucide-react';
import { marketplaceService } from '../services/marketplace';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { showToast } from '../utils/toast';

export const MarketplaceCreate: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('books');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      showToast.warning('Title and Price are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('condition', condition);
      formData.append('location', location);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await marketplaceService.createListing(formData);
      showToast.success('Listing created successfully!');
      navigate(`/marketplace/${res.id}`);
    } catch (err: any) {
      showToast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'books', label: 'Books' },
    { value: 'notes', label: 'Notes' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'calculators', label: 'Calculators' },
    { value: 'lab_equipment', label: 'Lab Equipment' },
    { value: 'college_materials', label: 'College Essentials' },
    { value: 'other', label: 'Other' },
  ];

  const conditions = [
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/marketplace')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sell an Item</h1>
          <p className="text-xs text-gray-500">Post unused books, notes or calculators for other students.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Item Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Engineering Mathematics Textbook 3rd Ed"
            leftIcon={<Tag className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, edition, or details..."
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

            <Select
              label="Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              options={conditions}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="350.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
            />

            <Input
              label="Location / Pickup Point"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hostel Block A / Canteen"
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Item Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-teal-200 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/marketplace')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Post Listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default MarketplaceCreate;
