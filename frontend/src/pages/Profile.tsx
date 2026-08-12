import React, { useEffect, useState } from 'react';
import { Edit, Plus, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profilesService } from '../services/profiles';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/shared/LoadingState';
import { showToast } from '../utils/toast';
import type { Profile } from '../types';

export const ProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit fields
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  const loadProfile = async () => {
    try {
      const res = await profilesService.getMyProfile();
      setProfile(res);
      
      setBio(res.user.bio || '');
      setSkillsText(res.skills.join(', '));
      setInterestsText(res.interests.join(', '));
      setGithub(res.social_links?.github || '');
      setLinkedin(res.social_links?.linkedin || '');
      setTwitter(res.social_links?.twitter || '');
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const interestsArray = interestsText
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const payload = {
        skills: skillsArray,
        interests: interestsArray,
        bio: bio,
        social_links: {
          github,
          linkedin,
          twitter,
        },
      };

      await profilesService.updateMyProfile(payload);
      showToast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
      await loadProfile();
      await refreshUser();
    } catch (err) {
      showToast.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState type="profile" />;
  if (!profile) return <Card className="p-6 text-center text-gray-500">Failed to load profile.</Card>;

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
              <span className="text-primary font-semibold">
                {profile.user.department_detail?.short_name} • {profile.user.branch_detail?.short_name}
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span>Year {profile.user.year}</span>
              {profile.user.student_id && (
                <>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span>ID: {profile.user.student_id}</span>
                </>
              )}
            </div>

            {profile.user.bio ? (
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mt-1">{profile.user.bio}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No bio written yet. Click Edit Profile to tell others about yourself.</p>
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
            <p className="text-sm text-gray-400 italic">Add your programming languages, frameworks, or tools.</p>
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
            <p className="text-sm text-gray-400 italic">Add topics you are interested in (e.g. AI, Web Dev, UI/UX).</p>
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

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleSave} className="space-y-5 text-left">
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 block">Bio / About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="CS student passionate about building smart campus tools..."
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <span className="text-[10px] text-gray-400 block mt-1">Maximum 500 characters.</span>
          </div>

          <Input
            label="Skills (comma separated)"
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Python, React, TypeScript, Django, Figma"
          />

          <Input
            label="Interests (comma separated)"
            type="text"
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
            placeholder="Artificial Intelligence, Web Dev, Cyber Security"
          />

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Social Handles</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="GitHub URL"
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
              />
              <Input
                label="LinkedIn URL"
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
              <Input
                label="Twitter/X URL"
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ProfilePage;
