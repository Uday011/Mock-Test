'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  PlusCircle,
  Play,
  Copy,
  Trash2,
  Edit,
  Clock,
  Award,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Key,
  GraduationCap,
  Crown,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
  Sparkles,
  Sliders,
  Tag,
  History,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface StudentData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  institute_name: string | null;
  created_at: string;
  total_attempts: number;
  avg_score: number | null;
  best_score: number | null;
  last_active_at: string | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'tests' | 'submissions' | 'review_queue' | 'educators'>('students');

  // Review Queue state
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [loadingReviewQueue, setLoadingReviewQueue] = useState(false);
  const [reviewActionNote, setReviewActionNote] = useState<{ [testId: string]: string }>({});
  const [actionProcessing, setActionProcessing] = useState<string | null>(null);

  // Educator Verification state
  const [educators, setEducators] = useState<any[]>([]);
  const [loadingEducators, setLoadingEducators] = useState(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Students state
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Add student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit/Password student modal
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updatingStudent, setUpdatingStudent] = useState(false);

  // Tests & Submissions state
  const [tests, setTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testSearch, setTestSearch] = useState('');

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.role === 'student') {
          // If a student tries to open the admin dashboard, inform or redirect
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
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

  const fetchReviewQueue = async () => {
    setLoadingReviewQueue(true);
    try {
      const res = await fetch('/api/admin/review-queue');
      const data = await res.json();
      if (data.items) {
        setReviewQueue(data.items);
      }
    } catch (e) {
      console.error('Error fetching review queue:', e);
    } finally {
      setLoadingReviewQueue(false);
    }
  };

  const fetchEducators = async () => {
    setLoadingEducators(true);
    try {
      const res = await fetch('/api/admin/educators/verify');
      const data = await res.json();
      if (data.educators) {
        setEducators(data.educators);
      }
    } catch (e) {
      console.error('Error fetching educators:', e);
    } finally {
      setLoadingEducators(false);
    }
  };

  const showAdminToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleReviewAction = async (testId: string, action: 'approve' | 'revisions_requested' | 'reject') => {
    setActionProcessing(testId);
    try {
      const notes = reviewActionNote[testId] || '';
      const res = await fetch('/api/admin/review-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testId,
          action,
          review_notes: notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showAdminToast(data.message || 'Review action recorded');
        fetchReviewQueue();
        fetchTests();
      } else {
        showAdminToast(data.error || 'Failed to update review');
      }
    } catch (err: any) {
      showAdminToast(err.message || 'Error processing review action');
    } finally {
      setActionProcessing(null);
    }
  };

  const handleVerifyEducator = async (userId: string, status: 'verified' | 'unverified' | 'pending') => {
    setActionProcessing(userId);
    try {
      const res = await fetch('/api/admin/educators/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          verification_status: status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showAdminToast(data.message || 'Educator verification updated');
        fetchEducators();
      } else {
        showAdminToast(data.error || 'Failed to update educator status');
      }
    } catch (err: any) {
      showAdminToast(err.message || 'Error updating verification');
    } finally {
      setActionProcessing(null);
    }
  };

  const [showSavedBanner, setShowSavedBanner] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchStudents();
    fetchTests();
    fetchReviewQueue();
    fetchEducators();
    if (typeof window !== 'undefined' && window.location.search.includes('saved=true')) {
      setShowSavedBanner(true);
    }
  }, []);

  // Handle Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newStudentName.trim() || !newStudentEmail.trim() || !newStudentPassword.trim()) {
      setCreateError('All fields are required');
      return;
    }
    setCreatingStudent(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName.trim(),
          email: newStudentEmail.trim(),
          password: newStudentPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create student');
      } else {
        setShowAddModal(false);
        setNewStudentName('');
        setNewStudentEmail('');
        setNewStudentPassword('');
        fetchStudents();
      }
    } catch (err: any) {
      setCreateError(err?.message || 'Network error');
    } finally {
      setCreatingStudent(false);
    }
  };

  // Toggle student status (active / suspended)
  const handleToggleStatus = async (student: StudentData) => {
    const nextStatus = student.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Update Student (Name or Password)
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdatingStudent(true);
    try {
      const body: any = { studentId: editingStudent.id };
      if (editName.trim() && editName.trim() !== editingStudent.name) {
        body.name = editName.trim();
      }
      if (editPassword.trim()) {
        body.password = editPassword.trim();
      }

      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingStudent(null);
        setEditName('');
        setEditPassword('');
        fetchStudents();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStudent(false);
    }
  };

  // Handle Delete Student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student? Their test history will be deleted.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/students?id=${studentId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStudents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter tests created by admin/superadmin
  const filteredTests = tests.filter((t) =>
    t.title.toLowerCase().includes(testSearch.toLowerCase()) ||
    (t.subject && t.subject.toLowerCase().includes(testSearch.toLowerCase()))
  );

  // Flatten submissions from tests
  const allSubmissions = tests.flatMap((t) =>
    (t.attempts || []).map((att: any) => ({
      ...att,
      testTitle: t.title,
      testSubject: t.subject,
    }))
  );

  // Compute summary stats
  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;
  const totalTestsCount = tests.length;
  const totalSubmissionsCount = allSubmissions.length;
  const avgBatchAccuracy =
    allSubmissions.length > 0
      ? Math.round(
          allSubmissions.reduce((acc, a) => acc + (a.accuracy || a.percentage || 0), 0) /
            allSubmissions.length
        )
      : 0;

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'No time limit';
    const mins = Math.floor(seconds / 60);
    return `${mins} mins`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Test Saved / Published Confirmation Banner */}
      {showSavedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Official Mock Test Saved & Published!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                The test paper has been added to your Institute Mock Library below and is now accessible to all your enrolled students.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSavedBanner(false)}
            className="text-emerald-700 hover:text-emerald-950 text-base font-bold px-2 py-1"
            aria-label="Dismiss banner"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              Administrator & Coaching Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {currentUser?.institute_name || 'Apex Institute Platform'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Teacher & Institute Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Publish official mock tests for your students, manage student enrollments & login accounts, and monitor batch test performance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-xs"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>

          <Link
            href="/tests/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Create Official Mock
          </Link>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalStudentsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Institute Mocks</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalTestsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Batch Submissions</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{totalSubmissionsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Batch Accuracy</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{avgBatchAccuracy}%</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 min-h-[44px] ${
              activeTab === 'students'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Enrolled Students ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 min-h-[44px] ${
              activeTab === 'tests'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Institute Mock Tests ({tests.length})
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 min-h-[44px] ${
              activeTab === 'submissions'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Batch Gradebook ({allSubmissions.length})
          </button>

          <button
            onClick={() => setActiveTab('review_queue')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 min-h-[44px] ${
              activeTab === 'review_queue'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Review Queue ({reviewQueue.filter((r) => r.status === 'under_review').length})
          </button>

          <button
            onClick={() => setActiveTab('educators')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 min-h-[44px] ${
              activeTab === 'educators'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Educators ({educators.length})
          </button>
        </div>

        {/* TAB 1: Enrolled Students Management */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full sm:w-72 pl-8 pr-3 py-2 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 min-h-[40px] border border-slate-300 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <button
                onClick={fetchStudents}
                className="p-2 min-h-[40px] text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-xl text-xs flex items-center justify-center gap-1 self-start sm:self-auto border border-slate-200 sm:border-transparent"
                title="Refresh student list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {loadingStudents ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading enrolled students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {studentSearch
                    ? 'No students matched your search criteria.'
                    : 'Add students to allow them to take your institute mock tests and access AI reports.'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Enroll First Student
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Student</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Attempts</th>
                        <th className="px-4 py-3">Avg. Score</th>
                        <th className="px-4 py-3">Best Score</th>
                        <th className="px-4 py-3">Enrolled On</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{s.name}</p>
                                <p className="text-[11px] text-slate-500">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {s.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" />
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">
                            {s.total_attempts} tests
                          </td>
                          <td className="px-4 py-3.5 font-bold text-emerald-700">
                            {s.avg_score != null ? `${s.avg_score}%` : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900">
                            {s.best_score != null ? `${s.best_score}%` : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(s)}
                                title={s.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                className={`p-2 min-h-[36px] min-w-[36px] rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center ${
                                  s.status === 'active'
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {s.status === 'active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => {
                                  setEditingStudent(s);
                                  setEditName(s.name);
                                  setEditPassword('');
                                }}
                                title="Edit Student or Reset Password"
                                className="p-2 min-h-[36px] min-w-[36px] border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors flex items-center justify-center"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(s.id)}
                                title="Remove Student"
                                className="p-2 min-h-[36px] min-w-[36px] border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

        {/* TAB 2: Institute Mock Tests */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search mock tests..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="w-full sm:w-72 pl-8 pr-3 py-2 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>

              <Link
                href="/tests/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-blue-400" />
                Upload New Mock Paper
              </Link>
            </div>

            {loadingTests ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading tests...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No mock tests published yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an exam question paper and answer key to create an official mock for your enrolled students.
                </p>
                <Link
                  href="/tests/create"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                  Create First Mock
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-2xl border border-amber-300/80 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {test.subject || 'General'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(test.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{test.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {test.question_count} Questions
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDuration(test.duration_seconds)}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Sliders className="w-3.5 h-3.5 text-slate-400" />
                          +{test.default_correct_marks} / -{test.default_negative_marks} marks
                        </span>
                        <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {test.attempts_count} Student Attempts
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <Link
                        href={`/tests/${test.id}/start`}
                        className="flex-1 sm:flex-none justify-center px-4 py-2.5 min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Preview Exam
                      </Link>
                      <Link
                        href={`/tests/${test.id}`}
                        className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs transition-colors"
                        title="View Details & Questions"
                      >
                        <History className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Batch Submissions Gradebook */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Student Attempts Gradebook</h3>
                  <p className="text-[11px] text-slate-500">
                    Review each student's exam responses, marks, accuracy, and Gemini AI coaching insights.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                  {allSubmissions.length} Total Submissions
                </span>
              </div>

              {allSubmissions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs">
                  No student submissions recorded yet. Once students attempt your mock tests, their scores will appear here.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {allSubmissions.map((att) => (
                    <div
                      key={att.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{att.student_name || 'Student'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {att.testSubject || 'General'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{att.testTitle}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Submitted on {new Date(att.created_at).toLocaleString()} • Time: {Math.round(att.time_taken_seconds / 60)} mins
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-lg font-black text-slate-900">
                            {att.final_score} / {att.maximum_marks}
                          </span>
                          <p className="text-[11px] font-bold text-emerald-600">{att.percentage}% Score</p>
                        </div>

                        <Link
                          href={`/exam/${att.id}/result`}
                          className="px-4 py-2.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Review Paper
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Content Moderation & Review Queue */}
        {activeTab === 'review_queue' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Educational Assessment Moderation Queue</h3>
                <p className="text-[11px] text-slate-500">
                  Review submitted tests for syllabus alignment, marking key accuracy, copyright compliance, and pedagogical quality.
                </p>
              </div>
              <button
                onClick={fetchReviewQueue}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReviewQueue ? 'animate-spin' : ''}`} />
                Refresh Queue
              </button>
            </div>

            {loadingReviewQueue ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                Loading moderation queue...
              </div>
            ) : reviewQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-xs">
                No assessments currently waiting in the review queue.
              </div>
            ) : (
              <div className="space-y-3">
                {reviewQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            item.status === 'under_review'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : item.status === 'revisions_requested'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {item.status?.replace('_', ' ')}
                          </span>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            item.is_paid
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {item.is_paid ? `₹${item.price_inr}` : 'Free'}
                          </span>

                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.subject || 'General'} • {item.difficulty || 'Medium'} • {item.question_count} Questions
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                          <GraduationCap className="w-4 h-4 text-amber-700" />
                          <span className="font-bold text-slate-900">{item.creator?.name}</span>
                          <span className="text-slate-400 font-mono">({item.creator?.email})</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{item.creator?.institute}</span>
                        </div>

                        {item.review_notes && (
                          <div className="p-2.5 bg-amber-50 rounded-xl text-xs text-amber-950 border border-amber-200 mt-2">
                            <strong>Previous Review Note:</strong> {item.review_notes}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <Link href={`/tests/${item.id}`}>
                          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 transition-colors flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Preview Test
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Moderation Controls & Feedback Input */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Review Feedback / Revision Instructions (Optional):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Verified syllabus alignment and key accuracy. Approved for publishing."
                          value={reviewActionNote[item.id] || ''}
                          onChange={(e) =>
                            setReviewActionNote((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          disabled={actionProcessing === item.id}
                          onClick={() => handleReviewAction(item.id, 'reject')}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Reject to Draft
                        </button>
                        <button
                          disabled={actionProcessing === item.id}
                          onClick={() => handleReviewAction(item.id, 'revisions_requested')}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors"
                        >
                          Request Revisions
                        </button>
                        <button
                          disabled={actionProcessing === item.id}
                          onClick={() => handleReviewAction(item.id, 'approve')}
                          className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Educators & Faculty Accreditation */}
        {activeTab === 'educators' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Educators & Creator Accreditation Registry</h3>
                <p className="text-[11px] text-slate-500">
                  Manage educator verification status, credentials, and publishing permissions across the Nalanda ecosystem.
                </p>
              </div>
              <button
                onClick={fetchEducators}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEducators ? 'animate-spin' : ''}`} />
                Refresh Registry
              </button>
            </div>

            {loadingEducators ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                Loading educators...
              </div>
            ) : educators.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-xs">
                No educators or creator accounts registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {educators.map((edu) => (
                  <div
                    key={edu.user_id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-base">{edu.name}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          edu.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : edu.verification_status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {edu.verification_status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Role: {edu.role}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {edu.headline} • <span className="text-slate-500">{edu.institute_name}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono flex-wrap">
                        <span>Email: <strong className="text-slate-800">{edu.email}</strong></span>
                        <span>•</span>
                        <span>{edu.authored_tests_count} Tests Authored</span>
                        <span>•</span>
                        <span>{edu.series_count} Series</span>
                        <span>•</span>
                        <span>{edu.total_students} Learners Enrolled</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
                      <Link href={`/creators/${edu.user_id}`}>
                        <button className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Profile
                        </button>
                      </Link>

                      {edu.verification_status !== 'verified' ? (
                        <button
                          disabled={actionProcessing === edu.user_id}
                          onClick={() => handleVerifyEducator(edu.user_id, 'verified')}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verify Faculty
                        </button>
                      ) : (
                        <button
                          disabled={actionProcessing === edu.user_id}
                          onClick={() => handleVerifyEducator(edu.user_id, 'unverified')}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          Revoke Verification
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Toast Notification */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Enroll New Student</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium mb-4">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="student@coaching.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStudent}
                  className="px-4 py-2 min-h-[40px] bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {creatingStudent ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student / Password Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Edit Student Account</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-xl font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password (leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  placeholder="New password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[40px] border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStudent}
                  className="px-4 py-2 min-h-[40px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {updatingStudent ? 'Saving...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
