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
import { AppShell } from '@/components/layout/AppShell';

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
    <AppShell
      breadcrumbs={[
        { label: 'Administration', href: '/dashboard/admin' },
        { label: 'Institute Hub' },
      ]}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Test Saved / Published Confirmation Banner */}
        {showSavedBanner && (
          <div className="p-3.5 rounded-md bg-[#e6f6ee] border border-[#c3eed7] text-[#1c7d49] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#1c7d49]" />
              <div>
                <p className="font-semibold text-[#1c7d49]">Official Mock Test Saved & Published!</p>
                <p className="text-[#1c7d49]/80 mt-0.5 text-[11px]">
                  The test paper has been added to your Institute Mock Library below and is now accessible to all your enrolled students.
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

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E6E6E3]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#FFFBEB] text-[#8f6b10] border border-[#fae6b4] flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-[#8f6b10]" />
                Administrator & Coaching Hub
              </span>
              <span className="text-xs text-[#787774]">
                {currentUser?.institute_name || 'Apex Institute Platform'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
              Teacher & Institute Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#787774] max-w-2xl leading-relaxed">
              Publish official mock tests for your students, manage student enrollments & login accounts, and monitor batch test performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white font-medium rounded-md shadow-2xs transition-colors text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Student
            </button>

            <Link
              href="/tests/create"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-white hover:bg-[#F1F1EF] text-[#202124] font-medium rounded-md border border-[#E6E6E3] shadow-2xs transition-colors text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#787774]" />
              Create Official Mock
            </Link>
          </div>
        </div>

        {/* Overview Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Enrolled Students</span>
              <Users className="w-4 h-4 text-[#787774]" />
            </div>
            <p className="text-2xl font-bold text-[#202124] mt-1">{totalStudentsCount}</p>
          </div>

          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Institute Mocks</span>
              <Layers className="w-4 h-4 text-[#787774]" />
            </div>
            <p className="text-2xl font-bold text-[#202124] mt-1">{totalTestsCount}</p>
          </div>

          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Batch Submissions</span>
              <CheckCircle className="w-4 h-4 text-[#1c7d49]" />
            </div>
            <p className="text-2xl font-bold text-[#1c7d49] mt-1">{totalSubmissionsCount}</p>
          </div>

          <div className="bg-white rounded-md p-4 border border-[#E6E6E3] shadow-2xs">
            <div className="flex items-center justify-between text-[#787774] mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Avg Batch Accuracy</span>
              <Award className="w-4 h-4 text-[#2383e2]" />
            </div>
            <p className="text-2xl font-bold text-[#2383e2] mt-1">{avgBatchAccuracy}%</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="space-y-6">
          <div className="flex items-center border-b border-[#E6E6E3] gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-px text-xs font-medium">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'students'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Enrolled Students
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {students.length}
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
              Institute Mock Tests
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {tests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'submissions'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Batch Gradebook
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {allSubmissions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('review_queue')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'review_queue'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#8f6b10]" />
              Review Queue
              <span className="px-1.5 py-0.2 rounded-full bg-[#FFFBEB] text-[10px] text-[#8f6b10] font-bold">
                {reviewQueue.filter((r) => r.status === 'under_review').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('educators')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all shrink-0 min-h-[36px] ${
                activeTab === 'educators'
                  ? 'border-[#202124] text-[#202124] font-semibold'
                  : 'border-transparent text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-t-md'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#2383e2]" />
              Educators
              <span className="px-1.5 py-0.2 rounded-full bg-[#f1f1ef] text-[10px] text-[#787774]">
                {educators.length}
              </span>
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
                      className="w-full sm:w-72 pl-8 pr-3 py-1.5 min-h-[36px] border border-[#E6E6E3] bg-white rounded-md text-xs text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-2.5 top-2.5" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs text-[#202124] bg-white focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <button
                  onClick={fetchStudents}
                  className="p-2 min-h-[36px] text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md text-xs flex items-center justify-center gap-1 self-start sm:self-auto border border-[#E6E6E3] transition-colors"
                  title="Refresh student list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {loadingStudents ? (
                <div className="p-12 text-center text-[#787774] text-sm">
                  <div className="w-6 h-6 border-2 border-[#202124] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading enrolled students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="bg-white rounded-md p-10 text-center border border-dashed border-[#E6E6E3] space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#f1f1ef] text-[#787774] flex items-center justify-center mx-auto">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#202124]">No students found</h3>
                  <p className="text-xs text-[#787774] max-w-sm mx-auto">
                    {studentSearch
                      ? 'No students matched your search criteria.'
                      : 'Add students to allow them to take your institute mock tests and access AI reports.'}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202124] hover:bg-[#201e1d] text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Enroll First Student
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-md border border-[#E6E6E3] overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] font-semibold text-[#787774] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Student</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">Attempts</th>
                          <th className="px-3 py-2.5">Avg. Score</th>
                          <th className="px-3 py-2.5">Best Score</th>
                          <th className="px-3 py-2.5">Enrolled On</th>
                          <th className="px-4 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E6E3] font-normal">
                        {filteredStudents.map((s) => (
                          <tr key={s.id} className="hover:bg-[#F1F1EF]/80 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#f1f1ef] text-[#202124] font-semibold flex items-center justify-center text-xs border border-[#E6E6E3]">
                                  {s.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#202124]">{s.name}</p>
                                  <p className="text-[11px] text-[#787774]">{s.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {s.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#e6f6ee] text-[#1c7d49] border border-[#c3eed7]">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#fbebe9] text-[#c43228] border border-[#fad2cf]">
                                  <XCircle className="w-2.5 h-2.5" />
                                  Suspended
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 font-medium text-[#202124]">
                              {s.total_attempts} tests
                            </td>
                            <td className="px-3 py-3 font-semibold text-[#1c7d49]">
                              {s.avg_score != null ? `${s.avg_score}%` : '—'}
                            </td>
                            <td className="px-3 py-3 font-semibold text-[#202124]">
                              {s.best_score != null ? `${s.best_score}%` : '—'}
                            </td>
                            <td className="px-3 py-3 text-[#787774] font-mono text-[11px]">
                              {new Date(s.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleToggleStatus(s)}
                                  title={s.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                                  className={`p-1.5 min-h-[30px] min-w-[30px] rounded-md border text-xs transition-colors flex items-center justify-center ${
                                    s.status === 'active'
                                      ? 'border-[#E6E6E3] text-[#c43228] hover:bg-[#fbebe9]'
                                      : 'border-[#E6E6E3] text-[#1c7d49] hover:bg-[#e6f6ee]'
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
                                  className="p-1.5 min-h-[30px] min-w-[30px] border border-[#E6E6E3] text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md text-xs transition-colors flex items-center justify-center"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteStudent(s.id)}
                                  title="Remove Student"
                                  className="p-1.5 min-h-[30px] min-w-[30px] border border-[#E6E6E3] text-[#9b9a97] hover:text-[#c43228] hover:bg-[#fbebe9] rounded-md text-xs transition-colors flex items-center justify-center"
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
                    className="w-full sm:w-72 pl-8 pr-3 py-1.5 min-h-[36px] border border-[#E6E6E3] bg-white rounded-md text-xs text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-2.5 top-2.5" />
                </div>

                <Link
                  href="/tests/create"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white font-medium rounded-md text-xs shadow-2xs transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Upload New Mock Paper
                </Link>
              </div>

              {loadingTests ? (
                <div className="p-12 text-center text-[#787774] text-sm">
                  <div className="w-6 h-6 border-2 border-[#202124] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading tests...
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="bg-white rounded-md p-10 text-center border border-dashed border-[#E6E6E3] space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#f1f1ef] text-[#787774] flex items-center justify-center mx-auto">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#202124]">No mock tests published yet</h3>
                  <p className="text-xs text-[#787774] max-w-sm mx-auto">
                    Upload an exam question paper and answer key to create an official mock for your enrolled students.
                  </p>
                  <Link
                    href="/tests/create"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Create First Mock
                  </Link>
                </div>
              ) : (
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
                            {new Date(test.created_at).toLocaleDateString()}
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
                            {formatDuration(test.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Sliders className="w-3.5 h-3.5 text-[#9b9a97]" />
                            +{test.default_correct_marks} / -{test.default_negative_marks} marks
                          </span>
                          <span className="flex items-center gap-1 font-medium text-[#1c7d49] bg-[#e6f6ee] px-2 py-0.5 rounded-[3px] border border-[#c3eed7]">
                            <Users className="w-3.5 h-3.5 text-[#1c7d49]" />
                            {test.attempts_count} Student Attempts
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E6E6E3]">
                        <Link
                          href={`/tests/${test.id}/start`}
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white font-medium rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Preview Exam
                        </Link>
                        <Link
                          href={`/tests/${test.id}`}
                          className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#E6E6E3] hover:bg-[#F1F1EF] text-[#787774] hover:text-[#202124] rounded-md text-xs transition-colors"
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
              <div className="bg-white rounded-md border border-[#E6E6E3] overflow-hidden shadow-2xs">
                <div className="p-3.5 bg-[#F7F7F5] border-b border-[#E6E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#202124]">Student Attempts Gradebook</h3>
                    <p className="text-[11px] text-[#787774]">
                      Review each student's exam responses, marks, accuracy, and Gemini AI coaching insights.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#787774] bg-[#f1f1ef] px-2.5 py-0.5 rounded-[3px] self-start sm:self-auto">
                    {allSubmissions.length} Total Submissions
                  </span>
                </div>

                {allSubmissions.length === 0 ? (
                  <div className="p-10 text-center text-[#787774] text-xs">
                    No student submissions recorded yet. Once students attempt your mock tests, their scores will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E6E6E3]">
                    {allSubmissions.map((att) => (
                      <div
                        key={att.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F1F1EF]/60 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#202124] text-sm">{att.student_name || 'Student'}</span>
                            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#f1f1ef] text-[#787774] border border-[#E6E6E3]">
                              {att.testSubject || 'General'}
                            </span>
                          </div>
                          <p className="text-xs text-[#787774]">{att.testTitle}</p>
                          <p className="text-[11px] text-[#9b9a97] font-mono">
                            Submitted on {new Date(att.created_at).toLocaleString()} • Time: {Math.round(att.time_taken_seconds / 60)} mins
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E6E3]">
                          <div className="text-left sm:text-right">
                            <span className="text-base font-bold text-[#202124]">
                              {att.final_score} / {att.maximum_marks}
                            </span>
                            <p className="text-[11px] font-medium text-[#1c7d49]">{att.percentage}% Score</p>
                          </div>

                          <Link
                            href={`/exam/${att.id}/result`}
                            className="px-3 py-1.5 min-h-[36px] bg-white hover:bg-[#F1F1EF] text-[#202124] font-medium rounded-md text-xs border border-[#E6E6E3] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#8f6b10]" />
                            Review Paper
                            <ExternalLink className="w-3 h-3 text-[#787774]" />
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
              <div className="p-4 bg-white rounded-md border border-[#E6E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <h3 className="font-semibold text-[#202124] text-sm">Educational Assessment Moderation Queue</h3>
                  <p className="text-[11px] text-[#787774]">
                    Review submitted tests for syllabus alignment, marking key accuracy, copyright compliance, and pedagogical quality.
                  </p>
                </div>
                <button
                  onClick={fetchReviewQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E6E6E3] text-xs font-medium text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingReviewQueue ? 'animate-spin' : ''}`} />
                  Refresh Queue
                </button>
              </div>

              {loadingReviewQueue ? (
                <div className="p-12 text-center text-[#787774] text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#787774]" />
                  Loading moderation queue...
                </div>
              ) : reviewQueue.length === 0 ? (
                <div className="p-12 text-center text-[#787774] bg-white rounded-md border border-[#E6E6E3] text-xs">
                  No assessments currently waiting in the review queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviewQueue.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-md border border-[#E6E6E3] shadow-2xs space-y-3 hover:border-[#d9d8d6] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] uppercase ${
                              item.status === 'under_review'
                                ? 'bg-[#FFFBEB] text-[#8f6b10] border border-[#fae6b4]'
                                : item.status === 'revisions_requested'
                                ? 'bg-[#fbebe9] text-[#c43228] border border-[#fad2cf]'
                                : 'bg-[#e6f6ee] text-[#1c7d49] border border-[#c3eed7]'
                            }`}>
                              {item.status?.replace('_', ' ')}
                            </span>

                            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] ${
                              item.is_paid
                                ? 'bg-[#ebf5fe] text-[#2383e2] border border-[#cce5fb]'
                                : 'bg-[#f1f1ef] text-[#787774] border border-[#E6E6E3]'
                            }`}>
                              {item.is_paid ? `₹${item.price_inr}` : 'Free'}
                            </span>

                            <span className="text-[11px] text-[#787774] font-mono">
                              {item.subject || 'General'} • {item.difficulty || 'Medium'} • {item.question_count} Questions
                            </span>
                          </div>

                          <h4 className="font-semibold text-[#202124] text-sm">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-[#787774] line-clamp-2">{item.description}</p>
                          )}

                          <div className="flex items-center gap-2 pt-1 text-xs text-[#787774]">
                            <GraduationCap className="w-3.5 h-3.5 text-[#8f6b10]" />
                            <span className="font-medium text-[#202124]">{item.creator?.name}</span>
                            <span className="text-[#9b9a97] font-mono">({item.creator?.email})</span>
                            <span className="text-[#E6E6E3]">•</span>
                            <span className="text-[#787774]">{item.creator?.institute}</span>
                          </div>

                          {item.review_notes && (
                            <div className="p-2.5 bg-[#FFFBEB] rounded-md text-xs text-[#8f6b10] border border-[#fae6b4] mt-2">
                              <strong>Previous Review Note:</strong> {item.review_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          <Link href={`/tests/${item.id}`}>
                            <button className="px-3 py-1.5 bg-white hover:bg-[#F1F1EF] text-[#202124] font-medium rounded-md text-xs border border-[#E6E6E3] transition-colors flex items-center gap-1 shadow-2xs">
                              <Eye className="w-3.5 h-3.5 text-[#787774]" /> Preview Test
                            </button>
                          </Link>
                        </div>
                      </div>

                      {/* Moderation Controls & Feedback Input */}
                      <div className="pt-3 border-t border-[#E6E6E3] space-y-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[#787774] mb-1">
                            Review Feedback / Revision Instructions (Optional):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Verified syllabus alignment and key accuracy. Approved for publishing."
                            value={reviewActionNote[item.id] || ''}
                            onChange={(e) =>
                              setReviewActionNote((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            className="w-full px-3 py-1.5 rounded-md border border-[#E6E6E3] text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            disabled={actionProcessing === item.id}
                            onClick={() => handleReviewAction(item.id, 'reject')}
                            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#E6E6E3] text-[#787774] hover:bg-[#F1F1EF] hover:text-[#202124] transition-colors"
                          >
                            Reject to Draft
                          </button>
                          <button
                            disabled={actionProcessing === item.id}
                            onClick={() => handleReviewAction(item.id, 'revisions_requested')}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#FFFBEB] text-[#8f6b10] border border-[#fae6b4] hover:bg-[#fae6b4] transition-colors"
                          >
                            Request Revisions
                          </button>
                          <button
                            disabled={actionProcessing === item.id}
                            onClick={() => handleReviewAction(item.id, 'approve')}
                            className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-[#1c7d49] text-white hover:bg-[#16643b] transition-colors shadow-2xs flex items-center gap-1.5"
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
              <div className="p-4 bg-white rounded-md border border-[#E6E6E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <h3 className="font-semibold text-[#202124] text-sm">Educators & Creator Accreditation Registry</h3>
                  <p className="text-[11px] text-[#787774]">
                    Manage educator verification status, credentials, and publishing permissions across the Nalanda ecosystem.
                  </p>
                </div>
                <button
                  onClick={fetchEducators}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E6E6E3] text-xs font-medium text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingEducators ? 'animate-spin' : ''}`} />
                  Refresh Registry
                </button>
              </div>

              {loadingEducators ? (
                <div className="p-12 text-center text-[#787774] text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#787774]" />
                  Loading educators...
                </div>
              ) : educators.length === 0 ? (
                <div className="p-12 text-center text-[#787774] bg-white rounded-md border border-[#E6E6E3] text-xs">
                  No educators or creator accounts registered yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {educators.map((edu) => (
                    <div
                      key={edu.user_id}
                      className="p-4 bg-white rounded-md border border-[#E6E6E3] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#d9d8d6] transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#202124] text-sm">{edu.name}</span>
                          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-[3px] uppercase ${
                            edu.verification_status === 'verified'
                              ? 'bg-[#e6f6ee] text-[#1c7d49] border border-[#c3eed7]'
                              : edu.verification_status === 'pending'
                              ? 'bg-[#FFFBEB] text-[#8f6b10] border border-[#fae6b4]'
                              : 'bg-[#f1f1ef] text-[#787774] border border-[#E6E6E3]'
                          }`}>
                            {edu.verification_status}
                          </span>
                          <span className="text-[10px] font-mono text-[#9b9a97] uppercase">
                            Role: {edu.role}
                          </span>
                        </div>

                        <p className="text-xs text-[#787774]">
                          {edu.headline} • <span className="text-[#9b9a97]">{edu.institute_name}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-[#9b9a97] font-mono flex-wrap">
                          <span>Email: <strong className="text-[#202124] font-medium">{edu.email}</strong></span>
                          <span>•</span>
                          <span>{edu.authored_tests_count} Tests Authored</span>
                          <span>•</span>
                          <span>{edu.series_count} Series</span>
                          <span>•</span>
                          <span>{edu.total_students} Learners Enrolled</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E6E3] flex-wrap">
                        <Link href={`/creators/${edu.user_id}`}>
                          <button className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#E6E6E3] text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] transition-colors flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> Profile
                          </button>
                        </Link>

                        {edu.verification_status !== 'verified' ? (
                          <button
                            disabled={actionProcessing === edu.user_id}
                            onClick={() => handleVerifyEducator(edu.user_id, 'verified')}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#1c7d49] text-white hover:bg-[#16643b] transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verify Faculty
                          </button>
                        ) : (
                          <button
                            disabled={actionProcessing === edu.user_id}
                            onClick={() => handleVerifyEducator(edu.user_id, 'unverified')}
                            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#fad2cf] text-[#c43228] hover:bg-[#fbebe9] transition-colors"
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
          <div className="fixed bottom-6 right-6 z-50 bg-[#202124] text-white text-xs px-3.5 py-2.5 rounded-md shadow-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#2eaadc]" />
            <span>{adminToast}</span>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-[#E6E6E3]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#f1f1ef] text-[#202124] flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-[#202124] text-sm">Enroll New Student</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[#9b9a97] hover:text-[#202124] p-1 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              {createError && (
                <div className="p-2.5 bg-[#fbebe9] border border-[#fad2cf] rounded-md text-xs text-[#c43228] font-medium mb-4">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Student Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="student@coaching.com"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Temporary Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingStudent}
                    className="px-3.5 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202124]/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-lg border border-[#E6E6E3]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#f1f1ef] text-[#202124] flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-[#202124] text-sm">Edit Student Account</h3>
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="text-[#9b9a97] hover:text-[#202124] p-1 text-lg leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-[#787774] mb-1">
                    Reset Password (leave blank to keep unchanged)
                  </label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 min-h-[36px] border border-[#E6E6E3] rounded-md text-xs bg-white text-[#202124] placeholder-[#9b9a97] focus:outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-3 py-1.5 min-h-[36px] text-xs font-medium text-[#787774] hover:text-[#202124] hover:bg-[#F1F1EF] rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStudent}
                    className="px-3.5 py-1.5 min-h-[36px] bg-[#202124] hover:bg-[#201e1d] text-white rounded-md text-xs font-medium shadow-2xs transition-colors"
                  >
                    {updatingStudent ? 'Saving...' : 'Update Account'}
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
