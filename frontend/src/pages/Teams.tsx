import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import { teamsService } from '../services/teams';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchBar } from '../components/shared/SearchBar';
import { LoadingState } from '../components/shared/LoadingState';
import { Pagination } from '../components/shared/Pagination';
import { showToast } from '../utils/toast';
import type { Team } from '../types';

export const Teams: React.FC = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const loadTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (availableOnly) params.available = true;

      const res = await teamsService.listTeams(params);
      setTeams(res.results);
      setHasNext(!!res.next);
      setHasPrevious(!!res.previous);
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, status, availableOnly]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleJoinTeam = async (teamId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await teamsService.joinTeam(teamId);
      showToast.success('Successfully joined team!');
      loadTeams();
    } catch (err) {
      showToast.error(err);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans text-left pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-normal">Find your people.</h1>
          <p className="text-xs md:text-sm text-gray-500">Discover and join campus project or hackathon teams.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/teams/create')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Team
        </Button>
      </div>

      {/* Search & Basic Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full">
          <SearchBar
            onSearch={(val) => { setSearch(val); setCurrentPage(1); }}
            placeholder="Search team name, description, hackathon..."
          />
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            options={statusOptions}
            className="w-full sm:w-40"
          />
          
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer shrink-0 py-2">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => { setAvailableOnly(e.target.checked); setCurrentPage(1); }}
              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
            />
            Show Open Only
          </label>
        </div>
      </div>

      {/* Teams Grid */}
      {isLoading ? (
        <LoadingState count={3} />
      ) : teams.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">
          No teams found. Create one and find your teammates!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            return (
              <Card
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-primary/40 hover:shadow-xs transition-all h-full"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{team.name}</h3>
                    <Badge variant={team.status === 'open' ? 'success' : 'error'}>
                      {team.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {team.description || 'No description provided.'}
                  </p>

                  {team.hackathon_name && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{team.hackathon_name}</span>
                    </div>
                  )}

                  {/* Required skills */}
                  {team.required_skills && team.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {team.required_skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} size="sm" variant="primary">
                          {skill}
                        </Badge>
                      ))}
                      {team.required_skills.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-semibold self-center">
                          +{team.required_skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>
                      {team.current_member_count}/{team.max_members}
                    </span>
                  </div>

                  {team.status === 'open' && !team.is_full ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleJoinTeam(team.id, e)}
                    >
                      Join
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Closed</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};
export default Teams;
