import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Calendar, Check, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { lostFoundService } from '../services/lostFound';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/shared/LoadingState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { showToast } from '../utils/toast';
import type { LostFoundItem, LostFoundMatch } from '../types';

export const LostFoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [matches, setMatches] = useState<LostFoundMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Confirm dialogs
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchItemData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [itemData, matchesData] = await Promise.all([
        lostFoundService.getItem(Number(id)),
        lostFoundService.getMatches(Number(id)),
      ]);
      setItem(itemData);
      setMatches(matchesData);
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  if (isLoading) return <LoadingState type="page" />;
  if (!item) return <Card className="p-6 text-center text-gray-500">Item not found.</Card>;

  const isOwner = user?.id === item.user;

  const handleResolve = async () => {
    setIsActionLoading(true);
    try {
      await lostFoundService.resolveItem(item.id);
      showToast.success('Item report resolved!');
      setShowResolveDialog(false);
      await fetchItemData();
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await lostFoundService.deleteItem(item.id);
      showToast.success('Report deleted.');
      setShowDeleteDialog(false);
      navigate('/lost-found');
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
          onClick={() => navigate('/lost-found')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lost & Found
        </button>

        {isOwner && (
          <div className="flex gap-2">
            {item.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolveDialog(true)}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Mark Resolved
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

      {/* Main Details Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
        {/* Photo Column */}
        <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
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
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <Search className="w-12 h-12" />
              <span className="text-xs">No image provided</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge size="md" variant={item.item_type === 'lost' ? 'error' : 'success'}>
              {item.item_type.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge size="md" variant={item.status === 'active' ? 'primary' : 'gray'}>
              {item.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {item.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{item.title}</h1>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium py-2 border-y border-gray-100">
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location:{' '}
                  <strong className="text-gray-700">{item.location}</strong>
                </span>
              )}
              {item.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Date:{' '}
                  <strong className="text-gray-700">{new Date(item.date).toLocaleDateString()}</strong>
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
            )}
          </div>

          {/* Reporter Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-between gap-4 mt-auto">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${item.user}`)}
            >
              <Avatar name={item.user_detail?.username || 'User'} size="sm" />
              <div>
                <h4 className="font-semibold text-xs text-gray-900">
                  {item.user_detail?.first_name} {item.user_detail?.last_name}
                </h4>
                <p className="text-[10px] text-gray-500">@{item.user_detail?.username}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/profile/${item.user}`)}
            >
              View Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Matching Engine Results */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Potential Item Matches
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          Our matching engine scores similarity between lost and found entries based on category, title, and location.
        </p>

        {matches.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center italic">No potential matches found in the system yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m, idx) => (
              <Card
                key={idx}
                onClick={() => navigate(`/lost-found/${m.item.id}`)}
                className="p-4 border border-gray-150 hover:border-primary/40 cursor-pointer flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant={m.item.item_type === 'lost' ? 'error' : 'success'}>
                      {m.item.item_type.toUpperCase()}
                    </Badge>
                    <h4 className="font-semibold text-sm text-gray-900 mt-2 line-clamp-1">{m.item.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{m.item.location}</p>
                  </div>
                  <div className="bg-teal-50 border border-teal-200/50 rounded-full px-2.5 py-1 text-center shrink-0">
                    <span className="text-xs font-bold text-primary">{m.score}% Match</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Confirm Resolve Dialog */}
      <ConfirmDialog
        isOpen={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onConfirm={handleResolve}
        title="Mark Item as Resolved"
        message="Has this lost or found item been returned to its owner?"
        confirmText="Mark Resolved"
        isLoading={isActionLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report permanently?"
        confirmText="Delete"
        isDanger
        isLoading={isActionLoading}
      />
    </div>
  );
};
export default LostFoundDetail;
