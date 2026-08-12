import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Code,
  ShoppingBag,
  Search,
  Calendar,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profilesService } from '../services/profiles';
import { teamsService } from '../services/teams';
import { marketplaceService } from '../services/marketplace';
import { eventsService } from '../services/events';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/shared/LoadingState';
import type { Profile, Team, Listing, Event } from '../types';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profilesRes, teamsRes, listingsRes, eventsRes] = await Promise.all([
          profilesService.listProfiles({ page: 1 }),
          teamsService.listTeams({ page: 1 }),
          marketplaceService.listListings({ page: 1 }),
          eventsService.listEvents({ page: 1, upcoming: true }),
        ]);

        const filteredProfiles = profilesRes.results
          .filter((p) => p.user.id !== user?.id)
          .slice(0, 4);

        setProfiles(filteredProfiles);
        setTeams(teamsRes.results.slice(0, 3));
        setListings(listingsRes.results.slice(0, 3));
        setEvents(eventsRes.results.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const quickActions = [
    {
      title: 'Find Teammates',
      desc: 'Join hackathon or project groups',
      icon: <Code className="w-5 h-5 text-primary" />,
      color: 'bg-teal-50 border-teal-150',
      action: () => navigate('/teams'),
    },
    {
      title: 'Sell Materials',
      desc: 'List your books, calculators or notes',
      icon: <ShoppingBag className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-150',
      action: () => navigate('/marketplace/create'),
    },
    {
      title: 'Report Lost Item',
      desc: 'Create lost or found item report',
      icon: <Search className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-150',
      action: () => navigate('/lost-found/create'),
    },
    {
      title: 'Discover Events',
      desc: 'Explore campus programs & seminars',
      icon: <Calendar className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-150',
      action: () => navigate('/events'),
    },
  ];

  if (isLoading) {
    return <LoadingState type="page" />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-normal">
          Good morning, {user?.first_name || user?.username} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Welcome to your CampusConnect dashboard. Here's what is happening on campus today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, idx) => (
          <div
            key={idx}
            onClick={action.action}
            className={`border rounded-lg p-5 cursor-pointer hover:shadow-xs transition-all flex items-start gap-4 text-left ${action.color}`}
          >
            <div className="bg-white rounded-lg p-2.5 shadow-xs border border-gray-100/50 shrink-0">
              {action.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                {action.title} <ArrowUpRight className="w-3 h-3 text-gray-400" />
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-normal">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols wide) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Active Teams */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Active Teams
              </h2>
              <Link
                to="/teams"
                className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {teams.length === 0 ? (
              <div className="p-6 bg-white border border-gray-150 rounded-lg text-center text-xs text-gray-500">
                No active project teams yet. Be the first to build a team!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="p-5 flex flex-col gap-3 hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{team.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Project: {team.project_description || 'General Project'}
                        </p>
                      </div>
                      <Badge variant={team.is_full ? 'error' : 'success'}>
                        {team.current_member_count}/{team.max_members} Members
                      </Badge>
                    </div>
                    {team.required_skills && team.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {team.required_skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} size="sm" variant="primary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Marketplace Near You */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Marketplace Near You</h2>
              <Link
                to="/marketplace"
                className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {listings.length === 0 ? (
              <div className="p-6 bg-white border border-gray-150 rounded-lg text-center text-xs text-gray-500">
                No marketplace listings. Sell your old books or accessories!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => navigate(`/marketplace/${item.id}`)}
                    className="hover:border-gray-300 flex flex-col h-full"
                  >
                    <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
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
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge size="sm" variant="secondary">
                          {item.condition.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-xs text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.location}</p>
                      </div>
                      <span className="text-xs font-bold text-primary">₹{item.price}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col wide) */}
        <div className="flex flex-col gap-8">
          {/* Recommended Classmates */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Find Connections</h2>
              <Link
                to="/discover"
                className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {profiles.length === 0 ? (
              <div className="p-6 bg-white border border-gray-150 rounded-lg text-center text-xs text-gray-500">
                No recommendations found. Try completing your profile!
              </div>
            ) : (
              <div className="bg-white border border-gray-150 rounded-lg divide-y divide-gray-100 p-4">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/profile/${p.user.id}`)}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-gray-50/50 cursor-pointer px-2 rounded-md transition-colors"
                  >
                    <Avatar
                      src={p.user.profile_picture}
                      name={`${p.user.first_name} ${p.user.last_name}`}
                      size="sm"
                    />
                    <div className="overflow-hidden flex-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {p.user.first_name} {p.user.last_name}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate">
                        {p.user.branch_detail?.short_name} • Year {p.user.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
              <Link
                to="/events"
                className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {events.length === 0 ? (
              <div className="p-6 bg-white border border-gray-150 rounded-lg text-center text-xs text-gray-500">
                No upcoming events registered. Check back later!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="p-4 hover:border-gray-300 flex items-start gap-3"
                  >
                    <div className="bg-primary/5 rounded-lg p-2 text-primary shrink-0 font-bold border border-teal-200/20 text-center w-12 flex flex-col items-center">
                      <span className="text-[10px] uppercase font-semibold text-gray-500">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h3 className="font-semibold text-xs text-gray-900 truncate">{event.title}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">{event.venue}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
