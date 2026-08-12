import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { showToast } from '../utils/toast';
import type { Department, Branch } from '../types';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>('');
  const [studentId, setStudentId] = useState('');

  // Dropdown lists
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      setIsLoadingDropdowns(true);
      try {
        const depts = await authService.getDepartments();
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load departments', err);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    fetchDepts();
  }, []);

  // Fetch branches when department changes
  useEffect(() => {
    const fetchBranches = async () => {
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
        console.error('Failed to load branches', err);
      }
    };
    fetchBranches();
  }, [selectedDept]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast.warning('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        username,
        email,
        password,
        confirm_password: confirmPassword,
      };

      if (selectedDept) payload.department = Number(selectedDept);
      if (selectedBranch) payload.branch = Number(selectedBranch);
      if (year) payload.year = Number(year);
      if (studentId) payload.student_id = studentId;

      await register(payload);
      showToast.success('Account registered and logged in successfully!');
      navigate('/home');
    } catch (err: any) {
      showToast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deptOptions = [
    { value: '', label: 'Select Department' },
    ...departments.map((d) => ({ value: d.id, label: `${d.name} (${d.short_name})` })),
  ];

  const branchOptions = [
    { value: '', label: 'Select Branch' },
    ...branches.map((b) => ({ value: b.id, label: `${b.name} (${b.short_name})` })),
  ];

  const yearOptions = [
    { value: '', label: 'Select Year' },
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
    { value: 5, label: '5th Year' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Create student account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 border border-gray-150 rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nikhil_sharma"
                leftIcon={<UserIcon className="w-4 h-4" />}
              />

              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nikhil@college.edu"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Department"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : '')}
                options={deptOptions}
                disabled={isLoadingDropdowns}
              />

              <Select
                label="Branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
                options={branchOptions}
                disabled={!selectedDept || isLoadingDropdowns}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Year of Study"
                value={year}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                options={yearOptions}
              />

              <Input
                label="Student ID / Roll Number"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 2024CS001"
                leftIcon={<CreditCard className="w-4 h-4" />}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                isLoading={isSubmitting}
              >
                Register Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;
