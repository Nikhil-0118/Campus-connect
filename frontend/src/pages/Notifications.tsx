import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Check, UserPlus, Code, ShoppingBag, Search, Calendar } from 'lucide-react';
import { notificationsService } from '../services/notifications';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/shared/LoadingState';
import { EmptyState } from '../components/shared/EmptyState';
import { showToast } from '../utils/toast';
import type { Notification, NotificationType } from '../types';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsService.listNotifications({ page: 1 });
      setNotifications(res.results);
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      showToast.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast.success('All notifications marked as read.');
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'team_join':
        return <Code className="w-4 h-4 text-amber-600" />;
      case 'marketplace_interest':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'lost_found_match':
        return <Search className="w-4 h-4 text-indigo-600" />;
      case 'event_registration':
        return <Calendar className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) return <LoadingState type="list" count={5} />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-normal">Notifications</h1>
          <p className="text-xs md:text-sm text-gray-500">Stay updated on connections, team requests, and marketplace interests.</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            isLoading={isMarkingAll}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No notifications"
          description="You are all caught up! You will be notified here when activity occurs."
        />
      ) : (
        <div className="bg-white border border-gray-150 rounded-lg divide-y divide-gray-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors
                ${!n.is_read ? 'bg-teal-50/20' : 'hover:bg-gray-50/50'}`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-gray-50 rounded-full border border-gray-100 shrink-0 mt-0.5">
                  {getNotifIcon(n.notification_type)}
                </div>
                <div>
                  <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as read"
                  className="text-gray-400 hover:text-primary p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Notifications;
