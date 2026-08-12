import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Code, Calendar } from 'lucide-react';
import { teamsService } from '../services/teams';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { showToast } from '../utils/toast';

export const TeamCreate: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [maxMembers, setMaxMembers] = useState<number>(4);
  const [hackathonName, setHackathonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast.warning('Please provide a team name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        name,
        description,
        project_description: projectDescription,
        required_skills: skillsArray,
        max_members: Number(maxMembers),
        hackathon_name: hackathonName,
      };

      const newTeam = await teamsService.createTeam(payload);
      showToast.success('Team created successfully!');
      navigate(`/teams/${newTeam.id}`);
    } catch (err: any) {
      showToast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans text-left pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/teams')}
          className="text-gray-500 hover:text-gray-900 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create a Project Team</h1>
          <p className="text-xs text-gray-500">Form a group for hackathons, term projects, or side projects.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Team Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI Innovators"
            leftIcon={<Users className="w-4 h-4" />}
          />

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Short Pitch / Summary</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what your team is building or looking for..."
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Detailed Project Description</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Elaborate on the technical stack, goals, vision, or problem statement..."
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Hackathon / Event Name (Optional)"
              value={hackathonName}
              onChange={(e) => setHackathonName(e.target.value)}
              placeholder="e.g. Smart Campus Hackathon 2026"
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Maximum Members"
              type="number"
              min={1}
              max={20}
              required
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              leftIcon={<Users className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Required Skills (comma separated)"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="Python, React, Machine Learning, Figma"
            leftIcon={<Code className="w-4 h-4" />}
            helperText="Separate multiple skills with commas."
          />

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/teams')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Create Team
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default TeamCreate;
