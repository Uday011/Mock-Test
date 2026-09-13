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

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchSections();
    fetchTests();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Superadmin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-purple-700" />
              Super Administrator Console
            </span>
            <span className="text-xs text-slate-500 font-medium">Absolute Platform Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Platform Master Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Manage all administrators, coaching institutes, students, global mock tests, exam sections & categories, and AI infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddSectionModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-xs"
          >
            <FolderPlus className="w-4 h-4" />
            New Exam Section
          </button>

          <Link
            href="/tests/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Upload Test
          </Link>
        </div>
      </div>

      {/* High-Level System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{users.length}</p>
              <span className="text-[11px] text-purple-700 font-bold">
                {adminUsersCount} Admins / {studentUsersCount} Students
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">All Mock Tests</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{tests.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exam Sections</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{sections.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Coach</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">Online</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            User Management ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'sections'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            Sections & Categories ({sections.length})
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'tests'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            All Platform Tests ({tests.length})
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'system'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            System & AI Engine
          </button>
        </div>

        {/* TAB 1: Platform User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name, email, or institute..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs w-64 sm:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="admin">Administrators</option>
                  <option value="superadmin">Superadmins</option>
                </select>
              </div>

              <button
                onClick={fetchUsers}
                className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {loadingUsers ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading all platform accounts...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                <p className="text-sm font-bold text-slate-800">No users match criteria</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">User & Organization</th>
                        <th className="px-4 py-3">Role & Privilege</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Activity</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-5 py-3 text-right">Superadmin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                                  u.role === 'superadmin'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                    : u.role === 'admin'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                }`}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{u.name}</p>
                                <p className="text-[11px] text-slate-500">{u.email}</p>
                                {u.institute_name && (
                                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                    🏢 {u.institute_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleQuickRoleChange(u.id, e.target.value as UserRole)}
                              disabled={u.id === currentUser?.id}
                              className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="student">🎓 Student</option>
                              <option value="admin">🏫 Administrator</option>
                              <option value="superadmin">👑 Superadmin</option>
                            </select>
                          </td>

                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={u.id === currentUser?.id}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                            >
                              {u.status === 'active' ? '✓ Active' : '✕ Suspended'}
                            </button>
                          </td>

                          <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                            <div>
                              <strong>{u.tests_created}</strong> tests created
                            </div>
                            <div className="text-slate-400">
                              <strong>{u.attempts_made}</strong> attempts
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
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
                                className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {u.id !== currentUser?.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  title="Delete User"
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors"
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
                <h3 className="text-sm font-bold text-slate-900">Exam Sections & Domain Categories</h3>
                <p className="text-[11px] text-slate-500">
                  Configure the official categories used to classify question papers and mock tests.
                </p>
              </div>

              <button
                onClick={() => setShowAddSectionModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-sm self-start sm:self-auto"
              >
                <FolderPlus className="w-4 h-4" />
                Add New Section
              </button>
            </div>

            {loadingSections ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading exam sections...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {sec.id}
                        </span>
                        <button
                          onClick={() => handleToggleSection(sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            sec.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {sec.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{sec.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {sec.description || 'General examination section'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {sec.test_count || 0} Tests Linked
                      </span>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search across all tests and creators..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs w-64 sm:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <span className="text-xs font-bold text-slate-500">
                {filteredTests.length} Total Mock Tests in System
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {test.subject || 'General'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        By {test.created_by_name || 'User'} ({test.created_by_role || 'student'})
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">{test.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        {test.question_count} Questions
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {Math.floor((test.duration_seconds || 0) / 60)} mins
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {test.attempts_count} Attempts Recorded
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Link
                      href={`/tests/${test.id}/start`}
                      className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Take Test
                    </Link>
                    <Link
                      href={`/tests/${test.id}`}
                      className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs transition-colors"
                      title="Inspect paper"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: System & AI Engine Health */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Google Gemini AI Engine</h4>
                  <p className="text-xs text-slate-500">Autonomous performance analysis & parser</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold">Target Model:</span>
                  <span className="font-mono font-bold text-indigo-700">gemini-3.6-flash</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold">Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified & Operational
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold">Key Storage:</span>
                  <span className="text-slate-800 font-mono text-[11px]">Server Environment (.env.local)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Database & Persistence</h4>
                  <p className="text-xs text-slate-500">Local High-Performance SQLite storage</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold">Database Engine:</span>
                  <span className="font-bold text-slate-900">better-sqlite3 (WAL Mode)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold">Storage Location:</span>
                  <span className="font-mono text-slate-800 text-[11px]">./data/mocktest.db</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-semibold">Active Roles:</span>
                  <span className="font-bold text-purple-700">student, admin, superadmin</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Exam Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Create Exam Section</h3>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section / Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. UPSC Civil Services, Banking PO, NEET"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Brief summary of syllabus or target audience..."
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSection}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Modify User Account</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role Privilege</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="student">🎓 Student</option>
                  <option value="admin">🏫 Administrator</option>
                  <option value="superadmin">👑 Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institute Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Institute (optional)"
                  value={editInstitute}
                  onChange={(e) => setEditInstitute(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password (optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty to keep unchanged"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {updatingUser ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
