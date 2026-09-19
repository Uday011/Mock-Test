'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  ShieldCheck,
  Users,
  Layers,
  Sparkles,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  FolderPlus,
  Play,
  Copy,
  ExternalLink,
  Building2,
  GraduationCap,
  Key,
  Server,
  Database,
  Cpu,
  Eye,
  Sliders,
  Clock,
  Award,
} from 'lucide-react';
import { UserRole, Section } from '@/lib/types';
import { AppShell } from '@/components/layout/AppShell';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  institute_name: string | null;
  created_at: string;
  tests_created: number;
  attempts_made: number;
}

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sections' | 'tests' | 'system'>('users');

  // Users state
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin' | 'superadmin'>('all');

  // Edit user modal
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editPassword, setEditPassword] = useState('');
  const [editInstitute, setEditInstitute] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Sections state
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [creatingSection, setCreatingSection] = useState(false);

  // Tests state
  const [tests, setTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testSearch, setTestSearch] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/superadmin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const res = await fetch('/api/superadmin/sections');
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      if (data.tests) {
        setTests(data.tests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTests(false);
    }
  };

  const [showSavedBanner, setShowSavedBanner] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchSections();
    fetchTests();
    if (typeof window !== 'undefined' && window.location.search.includes('saved=true')) {
      setShowSavedBanner(true);
    }
  }, []);

  // Quick Role Toggle for User
  const handleQuickRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Status Toggle for User
  const handleToggleStatus = async (user: PlatformUser) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Update User Modal Submit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);
    try {
      const payload: any = {
        userId: editingUser.id,
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        institute_name: editInstitute.trim() || null,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUser(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/superadmin/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create Section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    setCreatingSection(true);
    try {
      const res = await fetch('/api/superadmin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSectionName.trim(),
          description: newSectionDescription.trim(),
        }),
      });
      if (res.ok) {
        setShowAddSectionModal(false);
        setNewSectionName('');
        setNewSectionDescription('');
        fetchSections();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingSection(false);
    }
  };

  // Handle Toggle Section Active State
  const handleToggleSection = async (section: any) => {
    try {
      const res = await fetch('/api/superadmin/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: section.id,
          is_active: !Boolean(section.is_active),
        }),
      });
      if (res.ok) {
        fetchSections();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this exam section?')) return;
    try {
      const res = await fetch(`/api/superadmin/sections?id=${sectionId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSections();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.institute_name && u.institute_name.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter tests
  const filteredTests = tests.filter((t) =>
    t.title.toLowerCase().includes(testSearch.toLowerCase()) ||
    (t.subject && t.subject.toLowerCase().includes(testSearch.toLowerCase())) ||
    (t.created_by_name && t.created_by_name.toLowerCase().includes(testSearch.toLowerCase()))
  );

  // Platform Metrics
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const studentUsersCount = users.filter((u) => u.role === 'student').length;
  const superadminUsersCount = users.filter((u) => u.role === 'superadmin').length;
  const totalAttemptsCount = users.reduce((acc, u) => acc + (u.attempts_made || 0), 0);

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Administration', href: '/dashboard/superadmin' },
        { label: 'Platform Console' },
      ]}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Test Saved / Published Confirmation Banner */}
        {showSavedBanner && (
          <div className="p-3.5 rounded-md bg-[#e6f6ee] border border-[#c3eed7] text-[#1c7d49] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#1c7d49]" />
              <div>
                <p className="font-semibold text-[#1c7d49]">Platform Mock Test Saved & Published!</p>
                <p className="text-[#1c7d49]/80 mt-0.5 text-[11px]">
                  The test paper has been stored in the Global Platform Mock Library and is now available across all institutes and student dashboards.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSavedBanner(false)}
              className="text-[#1c7d49]/70 hover:text-[#1c7d49] text-base font-bold px-2 py-1"
              aria-label="Dismiss banner"
            >
              &times;
            </button>
          </div>
        )}

        {/* Superadmin Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E6E6E3]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#FFFBEB] text-[#8f6b10] border border-[#fae6b4] flex items-center gap-1.5">
                <Crown className="w-3 h-3 text-[#8f6b10]" />
                Super Administrator Console
              </span>
              <span className="text-xs text-[#787774]">Absolute Platform Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
              Platform Master Console
            </h1>
            <p className="text-xs sm:text-sm text-[#787774] max-w-2xl leading-relaxed">
              Manage all administrators, coaching institutes, students, global mock tests, exam sections & categories, and AI infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setShowAddSectionModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white font-medium rounded-md shadow-2xs transition-colors text-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Exam Section
            </button>

            <Link
              href="/tests/create"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-white hover:bg-[#F1F1EF] text-[#202124] font-medium rounded-md border border-[#E6E6E3] shadow-2xs transition-colors text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#787774]" />
              Upload Test
            </Link>
          </div>
        </div>

        {/* High-Level System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-[#787774]" />
            </div>
            <p className="text-2xl font-bold text-[#202124] mt-1">{users.length}</p>
            <p className="text-[11px] text-[#787774] mt-0.5">
              {adminUsersCount} Admins • {studentUsersCount} Students
            </p>
          </div>

          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">All Mock Tests</span>
              <Layers className="w-4 h-4 text-[#787774]" />
            </div>
            <p className="text-2xl font-bold text-[#202124] mt-1">{tests.length}</p>
            <p className="text-[11px] text-[#787774] mt-0.5">
              {totalAttemptsCount} Student Attempts
            </p>
          </div>

          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Exam Sections</span>
              <FolderPlus className="w-4 h-4 text-[#787774]" />
            </div>
            <p className="text-2xl font-bold text-[#202124] mt-1">{sections.length}</p>
            <p className="text-[11px] text-[#787774] mt-0.5">
              Active domain partitions
            </p>
          </div>

          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">AI Coach Engine</span>
              <Sparkles className="w-4 h-4 text-[#8f6b10]" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#e6f6ee] text-[#1c7d49] border border-[#c3eed7]">
                <CheckCircle className="w-3 h-3" />
                Operational
              </span>
            </div>
            <p className="text-[11px] text-[#787774] mt-1.5">
              gemini-3.6-flash
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="space-y-6">
          <div className="flex items-center border-b border-[#E6E6E3] gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-px text-xs font-medium">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'users'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              User Management
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'sections'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Sections & Categories
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {sections.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'tests'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Platform Tests
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {tests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'system'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              System & AI Engine
            </button>
          </div>

          {/* TAB 1: Platform User Management */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      placeholder="Search users by name, email, or institute..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full sm:w-80 pl-8 pr-3 py-1.5 min-h-[36px] border border-[#E6E6E3] bg-white rounded-md text-xs text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-2.5 top-2.5" />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="px-3 py-1.5 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs text-[#202124] bg-white focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="admin">Administrators</option>
                    <option value="superadmin">Superadmins</option>
                  </select>
                </div>

                <button
                  onClick={fetchUsers}
                  className="p-2 min-h-[36px] text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md text-xs flex items-center justify-center gap-1 self-start sm:self-auto border border-[#E6E6E3] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {loadingUsers ? (
                <div className="p-12 text-center text-[#787774] text-sm">
                  <div className="w-6 h-6 border-2 border-[#202124] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading all platform accounts...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-md p-10 text-center border border-dashed border-[#E6E6E3] space-y-3">
                  <p className="text-xs text-[#787774]">No users match criteria</p>
                </div>
              ) : (
                <div className="bg-white rounded-md border border-[#E6E6E3] overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] font-semibold text-[#787774] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">User & Organization</th>
                          <th className="px-3 py-2.5">Role & Privilege</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">Activity</th>
                          <th className="px-3 py-2.5">Joined</th>
                          <th className="px-4 py-2.5 text-right">Superadmin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E6E3] font-normal">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-[#F1F1EF]/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-full font-medium flex items-center justify-center text-xs border ${
                                    u.role === 'superadmin'
                                      ? 'bg-[#FFFBEB] text-[#8f6b10] border-[#fae6b4]'
                                      : u.role === 'admin'
                                      ? 'bg-[#ebf5fe] text-[#2383e2] border-[#cce5fb]'
                                      : 'bg-[#f1f1ef] text-[#787774] border-[#E6E6E3]'
                                  }`}
                                >
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#202124]">{u.name}</p>
                                  <p className="text-[11px] text-[#787774]">{u.email}</p>
                                  {u.institute_name && (
                                    <p className="text-[10px] text-[#8f6b10] font-medium mt-0.5">
                                      🏢 {u.institute_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleQuickRoleChange(u.id, e.target.value as UserRole)}
                                disabled={u.id === currentUser?.id}
                                className="px-2 py-1 border border-[#E6E6E3] rounded-md text-xs font-medium bg-white text-[#202124] focus:outline-none focus:border-[#2383e2]"
                              >
                                <option value="student">🎓 Student</option>
                                <option value="admin">🏫 Administrator</option>
                                <option value="superadmin">👑 Superadmin</option>
                              </select>
                            </td>

                            <td className="px-3 py-3">
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={u.id === currentUser?.id}
                                className={`px-2 py-0.5 rounded-[3px] text-[10px] font-medium border transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-[#e6f6ee] text-[#1c7d49] border-[#c3eed7] hover:bg-[#d5f1e3]'
                                    : 'bg-[#fbebe9] text-[#c43228] border-[#fad2cf] hover:bg-[#fad2cf]'
                                }`}
                              >
                                {u.status === 'active' ? '✓ Active' : '✕ Suspended'}
                              </button>
                            </td>

                            <td className="px-3 py-3 text-[#787774] text-[11px]">
                              <div>
                                <strong className="text-[#202124]">{u.tests_created}</strong> tests created
                              </div>
                              <div className="text-[#9b9a97]">
                                <strong className="text-[#202124]">{u.attempts_made}</strong> attempts
                              </div>
                            </td>

                            <td className="px-3 py-3 text-[#787774] font-mono text-[11px]">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingUser(u);
                                    setEditName(u.name);
                                    setEditEmail(u.email);
                                    setEditRole(u.role);
                                    setEditInstitute(u.institute_name || '');
                                    setEditPassword('');
                                  }}
                                  title="Edit User or Reset Password"
                                  className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center border border-[#E6E6E3] text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md text-xs transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {u.id !== currentUser?.id && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    title="Delete User"
                                    className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center border border-[#E6E6E3] text-[#9b9a97] hover:text-[#c43228] hover:bg-[#fbebe9] rounded-md text-xs transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Sections & Categories Manager */}
          {activeTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#202124]">Exam Sections & Domain Categories</h3>
                  <p className="text-[11px] text-[#787774]">
                    Configure the official categories used to classify question papers and mock tests.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white font-medium rounded-md text-xs shadow-2xs self-start sm:self-auto transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Add New Section
                </button>
              </div>

              {loadingSections ? (
                <div className="p-12 text-center text-[#787774] text-sm">
                  <div className="w-6 h-6 border-2 border-[#202124] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading exam sections...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="bg-white rounded-md border border-[#E6E6E3] hover:border-[#d9d8d6] p-4 shadow-2xs space-y-3 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#f1f1ef] text-[#787774] border border-[#E6E6E3]">
                            {sec.id}
                          </span>
                          <button
                            onClick={() => handleToggleSection(sec)}
                            className={`px-2 py-0.5 rounded-[3px] text-[10px] font-medium border transition-colors ${
                              sec.is_active
                                ? 'bg-[#e6f6ee] text-[#1c7d49] border-[#c3eed7]'
                                : 'bg-[#f1f1ef] text-[#787774] border-[#E6E6E3]'
                            }`}
                          >
                            {sec.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </div>

                        <h4 className="text-sm font-semibold text-[#202124]">{sec.name}</h4>
                        <p className="text-xs text-[#787774] mt-1 leading-relaxed">
                          {sec.description || 'General examination section'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E6E6E3] flex items-center justify-between text-xs">
                        <span className="font-medium text-[#787774]">
                          {sec.test_count || 0} Tests Linked
                        </span>
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center text-[#9b9a97] hover:text-[#c43228] hover:bg-[#fbebe9] rounded-md transition-colors"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: All Platform Mock Tests */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search across all tests and creators..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="w-full sm:w-80 pl-8 pr-3 py-1.5 min-h-[36px] border border-[#E6E6E3] bg-white rounded-md text-xs text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-2.5 top-2.5" />
                </div>

                <span className="text-xs font-medium text-[#787774] self-start sm:self-auto">
                  {filteredTests.length} Total Mock Tests in System
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-md border border-[#E6E6E3] hover:border-[#d9d8d6] p-4 shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#F1F1EF] text-[#202124] border border-[#E6E6E3]">
                          {test.subject || 'General'}
                        </span>
                        <span className="text-xs text-[#9b9a97] font-mono">
                          By {test.created_by_name || 'User'} ({test.created_by_role || 'student'})
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#202124]">{test.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#787774]">
                        <span className="flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-[#9b9a97]" />
                          {test.question_count} Questions
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#9b9a97]" />
                          {Math.floor((test.duration_seconds || 0) / 60)} mins
                        </span>
                        <span className="flex items-center gap-1 font-medium text-[#1c7d49] bg-[#e6f6ee] px-2 py-0.5 rounded-[3px] border border-[#c3eed7]">
                          <Users className="w-3.5 h-3.5 text-[#1c7d49]" />
                          {test.attempts_count} Attempts Recorded
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6E6E3]">
                      <Link
                        href={`/tests/${test.id}/start`}
                        className="flex-1 sm:flex-none justify-center px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white font-medium rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Take Test
                      </Link>
                      <Link
                        href={`/tests/${test.id}`}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#E6E6E3] hover:bg-[#F1F1EF] text-[#787774] hover:text-[#202124] rounded-md text-xs transition-colors"
                        title="Inspect paper"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: System & AI Engine Health */}
          {activeTab === 'system' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-md border border-[#E6E6E3] p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#FFFBEB] text-[#8f6b10] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#202124] text-sm">Google Gemini AI Engine</h4>
                    <p className="text-xs text-[#787774]">Autonomous performance analysis & parser</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3]">
                    <span className="text-[#787774]">Target Model:</span>
                    <span className="font-mono font-medium text-[#202124]">gemini-3.6-flash</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3]">
                    <span className="text-[#787774]">Status:</span>
                    <span className="font-medium text-[#1c7d49] flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified & Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3]">
                    <span className="text-[#787774]">Key Storage:</span>
                    <span className="text-[#202124] font-mono text-[11px]">Server Environment (.env.local)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md border border-[#E6E6E3] p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#ebf5fe] text-[#2383e2] flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#202124] text-sm">Database & Persistence</h4>
                    <p className="text-xs text-[#787774]">Local High-Performance SQLite storage</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3]">
                    <span className="text-[#787774]">Database Engine:</span>
                    <span className="font-medium text-[#202124]">better-sqlite3 (WAL Mode)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3]">
                    <span className="text-[#787774]">Storage Location:</span>
                    <span className="font-mono text-[#202124] text-[11px]">./data/mocktest.db</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] rounded-md border border-[#E6E6E3]">
                    <span className="text-[#787774]">Active Roles:</span>
                    <span className="font-medium text-[#8f6b10]">student, admin, superadmin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Exam Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-[#E6E6E3]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#f1f1ef] text-[#202124] flex items-center justify-center">
                    <FolderPlus className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-[#202124] text-sm">Create Exam Section</h3>
                </div>
                <button
                  onClick={() => setShowAddSectionModal(false)}
                  className="text-[#9b9a97] hover:text-[#202124] p-1 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateSection} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Section / Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive Management, CAT Prep, B-School Aptitude"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Description</label>
                  <textarea
                    placeholder="Brief summary of syllabus or target audience..."
                    value={newSectionDescription}
                    onChange={(e) => setNewSectionDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(false)}
                    className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingSection}
                    className="px-3.5 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
                  >
                    {creatingSection ? 'Creating...' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-[#E6E6E3]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#f1f1ef] text-[#202124] flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-[#202124] text-sm">Modify User Account</h3>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-[#9b9a97] hover:text-[#202124] p-1 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Role Privilege</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  >
                    <option value="student">🎓 Student</option>
                    <option value="admin">🏫 Administrator</option>
                    <option value="superadmin">👑 Super Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Institute Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Institute (optional)"
                    value={editInstitute}
                    onChange={(e) => setEditInstitute(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                    Reset Password (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave empty to keep unchanged"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingUser}
                    className="px-3.5 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
                  >
                    {updatingUser ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
