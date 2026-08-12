import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Clock, Check, Sparkles, Plus, Globe } from 'lucide-react';
import { profilesService } from '../services/profiles';
import { connectionsService } from '../services/connections';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/shared/LoadingState';
import { showToast } from '../utils/toast';
import type { Profile } from '../types';

export const ProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const profileData = await profilesService.getProfile(Number(id));
        setProfile(profileData);

        const [connRes, reqRes] = await Promise.all([
          connectionsService.listConnections(),
          connectionsService.listRequests(),
        ]);

        const isConnected = connRes.results.some(
          (c) => c.sender.id === Number(id) || c.receiver.id === Number(id)
        );
        
        if (isConnected) {
          setConnectionStatus('accepted');
        } else {
          const isPending = reqRes.results.some(
            (r) => r.sender.id === Number(id) || r.receiver.id === Number(id)
          );
          if (isPending) {
            setConnectionStatus('pending');
          }
        }
      } catch (err) {
        showToast.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleConnect = async () => {
    if (!profile) return;
    setIsActionLoading(true);
    try {
      if (connectionStatus === 'none') {
        await connectionsService.sendRequest(profile.user.id);
        setConnectionStatus('pending');
        showToast.success('Connection request sent!');
      }
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <LoadingState type="profile" />;
  if (!profile) return <Card className="p-6 text-center text-gray-500">Failed to load student details.</Card>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <Avatar
            src={profile.user.profile_picture}
            name={`${profile.user.first_name} ${profile.user.last_name}`}
            size="xl"
          />
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-normal">
                  {profile.user.first_name} {profile.user.last_name}
                </h1>
                <p className="text-sm text-gray-500">@{profile.user.username}</p>
              </div>
              
              {connectionStatus === 'accepted' ? (
                <Button variant="outline" size="sm" disabled leftIcon={<Check className="w-4 h-4" />}>
                  Connected
                </Button>
              ) : connectionStatus === 'pending' ? (
                <Button variant="outline" size="sm" disabled leftIcon={<Clock className="w-4 h-4" />}>
                  Request Pending
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnect}
                  isLoading={isActionLoading}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Connect
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
              <span className="text-primary font-semibold">
                {profile.user.department_detail?.short_name} • {profile.user.branch_detail?.short_name}
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>Year {profile.user.year}</span>
            </div>

            {profile.user.bio && (
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mt-1">{profile.user.bio}</p>
            )}

            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              {profile.social_links?.github && (
                <a
                  href={profile.social_links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Globe className="w-4 h-4" /> GitHub
                </a>
              )}
              {profile.social_links?.linkedin && (
                <a
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1 font-semibold"
                >
                  <Globe className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {profile.social_links?.twitter && (
                <a
                  href={profile.social_links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-500 hover:text-sky-500 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Globe className="w-4 h-4" /> Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> Skills
          </h2>
          {profile.skills.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <Badge key={idx} variant="primary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" /> Interests
          </h2>
          {profile.interests.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No interests listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, idx) => (
                <Badge key={idx} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default ProfileDetail;
