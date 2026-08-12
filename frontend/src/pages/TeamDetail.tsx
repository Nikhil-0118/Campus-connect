import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Trash2, LogOut, UserPlus, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamsService } from '../services/teams';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { LoadingState } from '../components/shared/LoadingState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { showToast } from '../utils/toast';
import type { Team } from '../types';

export const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const fetchTeam = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await teamsService.getTeam(Number(id));
      setTeam(data);
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  if (isLoading) return <LoadingState type="page" />;
  if (!team) return <Card className="p-6 text-center text-gray-500">Team not found.</Card>;

  const isCreator = user?.id === team.creator;
  const isMember = team.members.some((m) => m.user_id === user?.id);

  const handleJoin = async () => {
    setIsActionLoading(true);
    try {
      await teamsService.joinTeam(team.id);
      showToast.success('Joined team!');
      await fetchTeam();
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsActionLoading(true);
    try {
      await teamsService.leaveTeam(team.id);
      showToast.success('Left team.');
      setShowLeaveDialog(false);
      await fetchTeam();
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await teamsService.deleteTeam(team.id);
      showToast.success('Team deleted.');
      setShowDeleteDialog(false);
      navigate('/teams');
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/teams')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </button>
        {isCreator && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Team
          </Button>
        )}
      </div>

      {/* Main Team Info Card */}
      <Card className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <Badge variant={team.status === 'open' ? 'success' : 'error'}>
                {team.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Created by <span className="font-semibold text-gray-700">@{team.creator_username}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div>
            {!isMember && team.status === 'open' && !team.is_full && (
              <Button
                variant="primary"
                size="md"
                onClick={handleJoin}
                isLoading={isActionLoading}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Join Team
              </Button>
            )}
            {isMember && !isCreator && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaveDialog(true)}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Leave Team
              </Button>
            )}
          </div>
        </div>

        {team.hackathon_name && (
          <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary-light/50 border border-teal-200/40 p-3 rounded-md">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Participating in: <strong>{team.hackathon_name}</strong></span>
          </div>
        )}

        {/* Pitch Summary */}
        {team.description && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1">Team Overview</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{team.description}</p>
          </div>
        )}

        {/* Project Description */}
        {team.project_description && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1">Project Details</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{team.project_description}</p>
          </div>
        )}

        {/* Required Skills */}
        {team.required_skills && team.required_skills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-primary" /> Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {team.required_skills.map((skill, idx) => (
                <Badge key={idx} variant="primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Roster & Members Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" /> Team Roster ({team.current_member_count}/{team.max_members})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {team.members.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/profile/${member.user_id}`)}
              className="py-3 flex items-center justify-between hover:bg-gray-50/50 cursor-pointer px-2 rounded-md transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar name={member.username} size="sm" />
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">@{member.username}</h4>
                  <span className="text-[10px] text-gray-400">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge variant={member.role === 'creator' ? 'primary' : 'gray'}>
                {member.role === 'creator' ? 'Team Lead' : 'Member'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Leave Dialog */}
      <ConfirmDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={handleLeave}
        title="Leave Team"
        message="Are you sure you want to leave this team?"
        confirmText="Leave"
        isDanger
        isLoading={isActionLoading}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Team"
        message="Are you sure you want to permanently delete this team? This action cannot be undone."
        confirmText="Delete"
        isDanger
        isLoading={isActionLoading}
      />
    </div>
  );
};
export default TeamDetail;
