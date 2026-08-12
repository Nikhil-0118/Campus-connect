import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MapPin, Tag, MessageSquare, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplace';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/shared/LoadingState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { showToast } from '../utils/toast';
import type { Listing, Interest } from '../types';

export const MarketplaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Interest Modal state
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');

  // Confirm dialogs
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchListing = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await marketplaceService.getListing(Number(id));
      setListing(data);

      // If user is seller, fetch interests on listing
      if (user?.id === data.seller) {
        const intRes = await marketplaceService.listingInterests(Number(id));
        setInterests(intRes.results);
      }
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id, user]);

  if (isLoading) return <LoadingState type="page" />;
  if (!listing) return <Card className="p-6 text-center text-gray-500">Listing not found.</Card>;

  const isSeller = user?.id === listing.seller;

  const handleSendInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      await marketplaceService.expressInterest(listing.id, interestMessage);
      showToast.success('Interest sent to seller!');
      setIsInterestModalOpen(false);
      setInterestMessage('');
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    setIsActionLoading(true);
    try {
      await marketplaceService.markSold(listing.id);
      showToast.success('Listing marked as sold!');
      setShowSoldDialog(false);
      await fetchListing();
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await marketplaceService.deleteListing(listing.id);
      showToast.success('Listing deleted.');
      setShowDeleteDialog(false);
      navigate('/marketplace');
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      {/* Back button & Action controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/marketplace')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        {isSeller && (
          <div className="flex gap-2">
            {listing.status === 'available' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSoldDialog(true)}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Mark as Sold
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Item Main Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Photo Column */}
        <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
          {listing.image ? (
            <img
              src={
                listing.image.startsWith('http')
                  ? listing.image
                  : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${listing.image}`
              }
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ShoppingBag className="w-12 h-12" />
              <span className="text-xs">No image provided</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge size="md" variant={listing.status === 'available' ? 'success' : 'gray'}>
              {listing.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {listing.category.replace('_', ' ')}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{listing.title}</h1>
              <span className="text-2xl font-bold text-primary inline-block mt-2">₹{listing.price}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium py-2 border-y border-gray-100">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gray-400" /> Condition:{' '}
                <strong className="capitalize text-gray-700">{listing.condition.replace('_', ' ')}</strong>
              </span>
              {listing.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Pickup:{' '}
                  <strong className="text-gray-700">{listing.location}</strong>
                </span>
              )}
            </div>

            {listing.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            )}
          </div>

          {/* Seller / Contact Action */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-between gap-4 mt-auto">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${listing.seller}`)}
            >
              <Avatar name={listing.seller_detail?.username || 'Seller'} size="sm" />
              <div>
                <h4 className="font-semibold text-xs text-gray-900">
                  {listing.seller_detail?.first_name} {listing.seller_detail?.last_name}
                </h4>
                <p className="text-[10px] text-gray-500">@{listing.seller_detail?.username}</p>
              </div>
            </div>

            {!isSeller && listing.status === 'available' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsInterestModalOpen(true)}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Contact Seller
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Seller View: Interested Buyers */}
      {isSeller && (
        <Card className="p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Interested Buyers ({interests.length})
          </h2>
          {interests.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No buyers have expressed interest yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {interests.map((int) => (
                <div key={int.id} className="py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-900">@{int.buyer_username}</span>
                    <span className="text-[10px] text-gray-400">{new Date(int.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                    "{int.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Express Interest Modal */}
      <Modal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        title="Contact Seller"
      >
        <form onSubmit={handleSendInterest} className="space-y-4 text-left">
          <p className="text-xs text-gray-500">
            Send a message to the seller asking if it's available or where to meet up.
          </p>
          <div>
            <textarea
              required
              rows={3}
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Hi! Is this item still available? Can we meet at the canteen?"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsInterestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isActionLoading}>
              Send Message
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Sold Dialog */}
      <ConfirmDialog
        isOpen={showSoldDialog}
        onClose={() => setShowSoldDialog(false)}
        onConfirm={handleMarkSold}
        title="Mark Item as Sold"
        message="Are you sure you want to mark this item as sold?"
        confirmText="Mark Sold"
        isLoading={isActionLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing permanently?"
        confirmText="Delete"
        isDanger
        isLoading={isActionLoading}
      />
    </div>
  );
};
export default MarketplaceDetail;
