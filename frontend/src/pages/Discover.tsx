import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Clock, Filter } from 'lucide-react';
import { profilesService } from '../services/profiles';
import { authService } from '../services/auth';
import { connectionsService } from '../services/connections';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchBar } from '../components/shared/SearchBar';
import { LoadingState } from '../components/shared/LoadingState';
import { Pagination } from '../components/shared/Pagination';
import { showToast } from '../utils/toast';
import type { Profile, Department, Branch } from '../types';

export const Discover: React.FC = () => {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Connection tracking to update UI states immediately after sending request
  const [sentRequests, setSentRequests] = useState<Record<number, boolean>>({});

  // Filter lists
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [skills, setSkills] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch departments on load
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const depts = await authService.getDepartments();
        setDepartments(depts);
      } catch (err) {
        console.error(err);
      }
    };
    loadDropdowns();
  }, []);

  // Fetch branches when department changes
  useEffect(() => {
    const loadBranches = async () => {
      if (!selectedDept) {
        setBranches([]);
        setSelectedBranch('');
        return;
      }
      try {
        const branchList = await authService.getBranches(selectedDept);
        setBranches(branchList);
        setSelectedBranch('');
      } catch (err) {
        console.error(err);
      }
    };
    loadBranches();
  }, [selectedDept]);

  // Load profiles
  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
      };
      if (search) params.search = search;
      if (selectedDept) params.user__department = selectedDept;
      if (selectedBranch) params.user__branch = selectedBranch;
      if (selectedYear) params.user__year = selectedYear;
      if (skills) params.skills = skills;

      const res = await profilesService.listProfiles(params);
      setProfiles(res.results);
      setHasNext(!!res.next);
      setHasPrevious(!!res.previous);
      
      // Compute total pages from result count (assuming default 20 size)
      setTotalPages(Math.ceil(res.count / 20));
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedDept, selectedBranch, selectedYear, skills]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleSendConnection = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid card click navigation
    try {
      await connectionsService.sendRequest(userId);
      setSentRequests((prev) => ({ ...prev, [userId]: true }));
      showToast.success('Connection request sent!');
    } catch (err: any) {
      showToast.error(err);
    }
  };

  const handleClearFilters = () => {
    setSelectedDept('');
    setSelectedBranch('');
    setSelectedYear('');
    setSkills('');
    setCurrentPage(1);
  };

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: d.id, label: d.short_name })),
  ];

  const branchOptions = [
    { value: '', label: 'All Branches' },
    ...branches.map((b) => ({ value: b.id, label: b.short_name })),
  ];

  const yearOptions = [
    { value: '', label: 'All Years' },
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
    { value: 5, label: '5th Year' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto font-sans text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-normal">Student Discovery</h1>
          <p className="text-xs md:text-sm text-gray-500">Connect with other classmates or filter by skills.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Global Search */}
      <div className="w-full">
        <SearchBar onSearch={(val) => { setSearch(val); setCurrentPage(1); }} placeholder="Search student names or usernames..." />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="p-5 flex flex-col gap-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-gray-700 uppercase tracking-wide">Filter Students</span>
            <button onClick={handleClearFilters} className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Select
              label="Department"
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1); }}
              options={deptOptions}
            />
            <Select
              label="Branch"
              value={selectedBranch}
              onChange={(e) => { setSelectedBranch(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1); }}
              options={branchOptions}
              disabled={!selectedDept}
            />
            <Select
              label="Year"
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1); }}
              options={yearOptions}
            />
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Skills (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => { setSkills(e.target.value); setCurrentPage(1); }}
                placeholder="Python, React, etc."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Profiles Grid */}
      {isLoading ? (
        <LoadingState count={6} />
      ) : profiles.length === 0 ? (
        <Card className="py-12 text-center text-gray-500">No students found matching your filters.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const isRequestSent = sentRequests[profile.user.id];
            
            return (
              <Card
                key={profile.id}
                onClick={() => navigate(`/profile/${profile.user.id}`)}
                className="p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-primary/40 hover:shadow-xs transition-all h-full"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={profile.user.profile_picture}
                    name={`${profile.user.first_name} ${profile.user.last_name}`}
                    size="md"
                  />
                  <div className="overflow-hidden flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {profile.user.first_name} {profile.user.last_name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">@{profile.user.username}</p>
                    <p className="text-xs text-primary font-medium mt-1 truncate">
                      {profile.user.branch_detail?.short_name || 'No Branch'} • Year {profile.user.year || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Skills */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} size="sm" variant="gray">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-semibold self-center">
                          +{profile.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Connect Action */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">
                      Dept: {profile.user.department_detail?.short_name || 'N/A'}
                    </span>
                    {isRequestSent ? (
                      <Button variant="outline" size="sm" disabled leftIcon={<Clock className="w-3.5 h-3.5" />}>
                        Pending
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleSendConnection(profile.user.id, e)}
                        leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
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
export default Discover;
