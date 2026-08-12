import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Home,
  Users,
  Code,
  ShoppingBag,
  Search as SearchIcon,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { notificationsService as notifApi } from '../../services/notifications';
import { searchService } from '../../services/search';
import { showToast } from '../../utils/toast';
import type { Notification } from '../../types';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Discover', path: '/discover', icon: <Users className="w-5 h-5" /> },
    { name: 'Teams', path: '/teams', icon: <Code className="w-5 h-5" /> },
    { name: 'Marketplace', path: '/marketplace', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Lost & Found', path: '/lost-found', icon: <SearchIcon className="w-5 h-5" /> },
    { name: 'Events', path: '/events', icon: <Calendar className="w-5 h-5" /> },
  ];

  const fetchUnreadNotifications = async () => {
    try {
      const res = await notifApi.listNotifications({ page: 1 });
      setNotifications(res.results.slice(0, 5));
      setUnreadCount(res.results.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchService.search(searchQuery);
        setSearchResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const markAllRead = async () => {
    try {
      await notifApi.markAllAsRead();
      setUnreadCount(0);
      fetchUnreadNotifications();
      showToast.success('All notifications marked as read');
    } catch (err) {
      showToast.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-left">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-150 flex-col shrink-0">
        <div className="p-6 border-b border-gray-150 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-lg text-gray-900">CampusConnect</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-primary-light text-primary border-l-2 border-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-150 flex items-center justify-between gap-3">
            <Link to="/profile" className="flex items-center gap-3 overflow-hidden">
              <Avatar src={user.profile_picture} name={`${user.first_name} ${user.last_name}`} size="sm" />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.first_name || user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-gray-150 px-4 py-3 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-base text-gray-900">CampusConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="text-gray-600 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => navigate('/notifications')}
              className="text-gray-600 p-1.5 hover:bg-gray-100 rounded-md relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 p-1.5 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Side Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-64 bg-white h-full flex flex-col pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-primary-light text-primary border-l-2 border-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="p-4 border-t border-gray-150 flex items-center justify-between gap-3">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <Avatar src={user.profile_picture} name={`${user.first_name} ${user.last_name}`} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.first_name || user.username}
                    </p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-650 cursor-pointer">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-gray-150 px-8 py-4 items-center justify-between">
          <div className="w-96 relative">
            <input
              type="text"
              readOnly
              onClick={() => setShowSearchModal(true)}
              placeholder="Search students, teams, marketplace listings, events..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer bg-gray-50/50 hover:bg-gray-50"
            />
            <SearchIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="text-gray-600 p-2 hover:bg-gray-100 rounded-full relative transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-150 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-primary hover:text-primary-dark font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 py-6 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifDropdown(false);
                            navigate('/notifications');
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer flex flex-col gap-0.5
                            ${!n.is_read ? 'bg-teal-50/20' : ''}`}
                        >
                          <p className="text-xs text-gray-700 font-medium line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-gray-100 pt-2 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs text-primary hover:text-primary-dark font-semibold inline-block py-1"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <Link to="/profile" className="flex items-center gap-2">
                <Avatar src={user.profile_picture} name={`${user.first_name} ${user.last_name}`} size="sm" />
                <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                  {user.first_name || user.username}
                </span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer" onClick={() => setShowSearchModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-100 flex flex-col max-h-[80vh] overflow-hidden z-10">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search students, teams, marketplace listings, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-base text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 rounded-md p-1 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isSearching && (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
                </div>
              )}

              {!isSearching && !searchResults && (
                <p className="text-sm text-gray-500 py-12 text-center">Type something to search across campus...</p>
              )}

              {!isSearching && searchResults && (
                <div className="space-y-6">
                  {searchResults.profiles && searchResults.profiles.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Students</h4>
                      <div className="space-y-2">
                        {searchResults.profiles.map((p: any) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              navigate(`/profile/${p.id}`);
                            }}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer border border-transparent hover:border-gray-100"
                          >
                            <Avatar src={p.user.profile_picture} name={`${p.user.first_name} ${p.user.last_name}`} size="xs" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {p.user.first_name} {p.user.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {p.user.branch_detail?.short_name} • Year {p.user.year}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.teams && searchResults.teams.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Teams</h4>
                      <div className="space-y-2">
                        {searchResults.teams.map((t: any) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              navigate(`/teams/${t.id}`);
                            }}
                            className="p-2 hover:bg-gray-50 rounded-md cursor-pointer border border-transparent hover:border-gray-100"
                          >
                            <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{t.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.listings && searchResults.listings.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Marketplace</h4>
                      <div className="space-y-2">
                        {searchResults.listings.map((l: any) => (
                          <div
                            key={l.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              navigate(`/marketplace/${l.id}`);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer border border-transparent hover:border-gray-100"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{l.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{l.description}</p>
                            </div>
                            <span className="text-sm font-semibold text-primary">₹{l.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.values(searchResults).every((arr: any) => arr.length === 0) && (
                    <p className="text-sm text-gray-500 py-12 text-center">No results found matching your query.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-1 px-2 flex justify-around items-center z-40">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-[10px] font-medium transition-colors
                ${isActive ? 'text-primary' : 'text-gray-500'}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
export default AppLayout;
