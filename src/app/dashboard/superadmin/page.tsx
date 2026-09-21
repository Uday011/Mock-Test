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
  BookOpen,
  FileText,
  Youtube,
  Globe,
  StickyNote,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  BookmarkCheck,
  Check,
  AlertTriangle,
  ArrowUpRight,
  LogOut,
  Settings,
  BarChart3,
  HelpCircle,
  Send,
  Zap,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

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

interface StudyResource {
  id: string;
  user_id: string;
  title: string;
  type: 'pdf' | 'youtube' | 'formula' | 'notes' | 'article' | 'website';
  subject_name: string;
  topic_name: string | null;
  source: string | null;
  url: string | null;
  notes: string | null;
  is_saved: number;
  created_at: string;
}

interface QuestionItem {
  id?: string;
  question_number?: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  correct_marks?: number;
  negative_marks?: number;
}

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'resources' | 'users' | 'sections' | 'system'>('overview');

  // Auth Gate state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
  const [testStatusFilter, setTestStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [testDifficultyFilter, setTestDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [testRoleFilter, setTestRoleFilter] = useState<'all' | 'superadmin' | 'admin' | 'student'>('all');

  // Edit / Modify Test Modal
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [editTestTitle, setEditTestTitle] = useState('');
  const [editTestSubject, setEditTestSubject] = useState('');
  const [editTestDurationMins, setEditTestDurationMins] = useState(60);
  const [editTestDifficulty, setEditTestDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [editTestStatus, setEditTestStatus] = useState<'published' | 'draft'>('published');
  const [editTestDescription, setEditTestDescription] = useState('');
  const [editTestQuestions, setEditTestQuestions] = useState<QuestionItem[]>([]);
  const [savingTest, setSavingTest] = useState(false);
  const [loadingTestDetails, setLoadingTestDetails] = useState(false);

  // Create Test Modal
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestSubject, setNewTestSubject] = useState('General Aptitude');
  const [newTestDurationMins, setNewTestDurationMins] = useState(60);
  const [newTestDifficulty, setNewTestDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newTestStatus, setNewTestStatus] = useState<'published' | 'draft'>('published');
  const [newTestDescription, setNewTestDescription] = useState('');
  const [newTestQuestions, setNewTestQuestions] = useState<QuestionItem[]>([
    {
      question_text: 'Sample question text. Which of the following is correct?',
      options: ['Option A statement', 'Option B statement', 'Option C statement', 'Option D statement'],
      correct_answer: 'A',
      explanation: 'Detailed explanation for why Option A is the correct answer.',
      correct_marks: 4,
      negative_marks: 1,
    },
  ]);
  const [creatingTest, setCreatingTest] = useState(false);

  // Study Resources state
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [resourceSubjectFilter, setResourceSubjectFilter] = useState('all');

  // Add Resource Modal
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<'pdf' | 'youtube' | 'formula' | 'notes' | 'article' | 'website'>('pdf');
  const [newResSubject, setNewResSubject] = useState('Quantitative Aptitude');
  const [newResTopic, setNewResTopic] = useState('');
  const [newResSource, setNewResSource] = useState('Platform Editorial Board');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResNotes, setNewResNotes] = useState('');
  const [creatingResource, setCreatingResource] = useState(false);

  // Edit Resource Modal
  const [editingResource, setEditingResource] = useState<StudyResource | null>(null);
  const [editResTitle, setEditResTitle] = useState('');
  const [editResType, setEditResType] = useState<'pdf' | 'youtube' | 'formula' | 'notes' | 'article' | 'website'>('pdf');
  const [editResSubject, setEditResSubject] = useState('');
  const [editResTopic, setEditResTopic] = useState('');
  const [editResSource, setEditResSource] = useState('');
  const [editResUrl, setEditResUrl] = useState('');
  const [editResNotes, setEditResNotes] = useState('');
  const [updatingResource, setUpdatingResource] = useState(false);

  // Alert toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth check & load data
  const checkSuperadminAuthAndLoad = async () => {
    setIsCheckingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user && data.user.role === 'superadmin') {
        setCurrentUser(data.user);
        fetchUsers();
        fetchSections();
        fetchTests();
        fetchResources();
      } else {
        setCurrentUser(data.user || null);
        setLoadingUsers(false);
        setLoadingSections(false);
        setLoadingTests(false);
        setLoadingResources(false);
      }
    } catch (e) {
      console.error(e);
      setCurrentUser(null);
      setLoadingUsers(false);
      setLoadingSections(false);
      setLoadingTests(false);
      setLoadingResources(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSuperadminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both Superadmin email and password.');
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail.trim(),
          password: authPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Invalid credentials.');
        setIsAuthenticating(false);
        return;
      }
      if (!data.user || data.user.role !== 'superadmin') {
        setAuthError(
          `Access Denied: Account (${data.user?.email || authEmail}) is assigned role '${data.user?.role || 'user'}' and does not possess Super Administrator privileges.`
        );
        setIsAuthenticating(false);
        return;
      }

      setCurrentUser(data.user);
      setAuthPassword('');
      setIsAuthenticating(false);
      fetchUsers();
      fetchSections();
      fetchTests();
      fetchResources();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/superadmin/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
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
      if (data.sections) setSections(data.sections);
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
      if (data.tests) setTests(data.tests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      if (data.resources) setResources(data.resources);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    checkSuperadminAuthAndLoad();
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
        showToast('User role updated successfully');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle user status active/suspended
  const handleToggleStatus = async (userToToggle: PlatformUser) => {
    const nextStatus = userToToggle.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToToggle.id, status: nextStatus }),
      });
      if (res.ok) {
        fetchUsers();
        showToast(`User status set to ${nextStatus}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save User Edit
  const handleSaveUserEdit = async (e: React.FormEvent) => {
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
      if (editPassword) payload.password = editPassword;

      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
        showToast('User details saved');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? All their tests and attempts will be removed.')) return;
    try {
      const res = await fetch(`/api/superadmin/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
        showToast('User permanently removed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Section
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
        showToast('Exam section created');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingSection(false);
    }
  };

  // Toggle Section
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
        showToast('Exam section status updated');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this exam section?')) return;
    try {
      const res = await fetch(`/api/superadmin/sections?id=${sectionId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSections();
        showToast('Exam section deleted');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Test Published/Draft Status
  const handleToggleTestStatus = async (testItem: any) => {
    const nextStatus = testItem.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/tests/${testItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchTests();
        showToast(`Test status set to ${nextStatus.toUpperCase()}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Edit Test Modal (fetches full test + questions)
  const handleOpenEditTest = async (testItem: any) => {
    setEditingTest(testItem);
    setEditTestTitle(testItem.title || '');
    setEditTestSubject(testItem.subject || 'General');
    setEditTestDurationMins(Math.floor((testItem.duration_seconds || 3600) / 60));
    setEditTestDifficulty(testItem.difficulty || 'medium');
    setEditTestStatus(testItem.status || 'published');
    setEditTestDescription(testItem.description || '');
    setLoadingTestDetails(true);

    try {
      const res = await fetch(`/api/tests/${testItem.id}`);
      const data = await res.json();
      if (data.test && data.test.questions) {
        setEditTestQuestions(
          data.test.questions.map((q: any) => ({
            id: q.id,
            question_number: q.question_number,
            question_text: q.question_text || '',
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correct_answer: q.correct_answer || 'A',
            explanation: q.explanation || '',
            correct_marks: q.correct_marks || 4,
            negative_marks: q.negative_marks || 1,
          }))
        );
      } else {
        setEditTestQuestions([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTestDetails(false);
    }
  };

  // Save Test Modifications
  const handleSaveTestModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;
    setSavingTest(true);
    try {
      const payload = {
        title: editTestTitle.trim(),
        subject: editTestSubject.trim(),
        duration_seconds: Math.max(60, Number(editTestDurationMins) * 60),
        difficulty: editTestDifficulty,
        status: editTestStatus,
        description: editTestDescription.trim(),
        questions: editTestQuestions,
      };

      const res = await fetch(`/api/tests/${editingTest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingTest(null);
        fetchTests();
        showToast('Test and question paper updated successfully');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update test');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTest(false);
    }
  };

  // Create New Official Test
  const handleCreateNewTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) return;
    setCreatingTest(true);
    try {
      const payload = {
        title: newTestTitle.trim(),
        subject: newTestSubject.trim(),
        duration_seconds: Math.max(60, Number(newTestDurationMins) * 60),
        difficulty: newTestDifficulty,
        status: newTestStatus,
        description: newTestDescription.trim(),
        trust_label: 'Platform Official',
        source: 'ExamCraft Platform Master',
        questions: newTestQuestions,
      };

      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateTestModal(false);
        setNewTestTitle('');
        setNewTestDescription('');
        fetchTests();
        showToast('Official platform mock test created!');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create test');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingTest(false);
    }
  };

  // Delete Test
  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to permanently delete this mock test? All questions and student attempts for it will be erased.')) return;
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTests();
        showToast('Test removed from platform');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Study Resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;
    setCreatingResource(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newResTitle.trim(),
          type: newResType,
          subject_name: newResSubject.trim(),
          topic_name: newResTopic.trim() || null,
          source: newResSource.trim() || 'Platform Editorial Board',
          url: newResUrl.trim() || null,
          notes: newResNotes.trim() || null,
        }),
      });
      if (res.ok) {
        setShowAddResourceModal(false);
        setNewResTitle('');
        setNewResTopic('');
        setNewResUrl('');
        setNewResNotes('');
        fetchResources();
        showToast('Study resource published to platform library!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingResource(false);
    }
  };

  // Edit Study Resource
  const handleOpenEditResource = (resItem: StudyResource) => {
    setEditingResource(resItem);
    setEditResTitle(resItem.title || '');
    setEditResType(resItem.type || 'pdf');
    setEditResSubject(resItem.subject_name || 'General');
    setEditResTopic(resItem.topic_name || '');
    setEditResSource(resItem.source || 'Platform Editorial Board');
    setEditResUrl(resItem.url || '');
    setEditResNotes(resItem.notes || '');
  };

  const handleSaveResourceEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    setUpdatingResource(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResource.id,
          title: editResTitle.trim(),
          type: editResType,
          subject_name: editResSubject.trim(),
          topic_name: editResTopic.trim() || null,
          source: editResSource.trim(),
          url: editResUrl.trim() || null,
          notes: editResNotes.trim() || null,
        }),
      });
      if (res.ok) {
        setEditingResource(null);
        fetchResources();
        showToast('Study resource updated successfully');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingResource(false);
    }
  };

  // Delete Study Resource
  const handleDeleteResource = async (resId: string) => {
    if (!confirm('Are you sure you want to delete this study resource?')) return;
    try {
      const res = await fetch(`/api/resources?id=${resId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchResources();
        showToast('Study resource deleted');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper question manipulation for modals
  const updateQuestionInList = (
    list: QuestionItem[],
    setList: React.Dispatch<React.SetStateAction<QuestionItem[]>>,
    idx: number,
    field: keyof QuestionItem,
    value: any
  ) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], [field]: value };
    setList(updated);
  };

  const updateOptionInQuestion = (
    list: QuestionItem[],
    setList: React.Dispatch<React.SetStateAction<QuestionItem[]>>,
    qIdx: number,
    optIdx: number,
    optValue: string
  ) => {
    const updated = [...list];
    const newOptions = [...updated[qIdx].options];
    newOptions[optIdx] = optValue;
    updated[qIdx] = { ...updated[qIdx], options: newOptions };
    setList(updated);
  };

  const addQuestionToList = (
    list: QuestionItem[],
    setList: React.Dispatch<React.SetStateAction<QuestionItem[]>>
  ) => {
    setList([
      ...list,
      {
        question_text: `New Question ${list.length + 1}`,
        options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
        correct_answer: 'A',
        explanation: '',
        correct_marks: 4,
        negative_marks: 1,
      },
    ]);
  };

  const removeQuestionFromList = (
    list: QuestionItem[],
    setList: React.Dispatch<React.SetStateAction<QuestionItem[]>>,
    idx: number
  ) => {
    if (list.length <= 1) {
      alert('A test must have at least one question.');
      return;
    }
    setList(list.filter((_, i) => i !== idx));
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.institute_name && u.institute_name.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Tests
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(testSearch.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(testSearch.toLowerCase())) ||
      (t.created_by_name && t.created_by_name.toLowerCase().includes(testSearch.toLowerCase()));

    const matchesStatus = testStatusFilter === 'all' || (t.status || 'published') === testStatusFilter;
    const matchesDiff = testDifficultyFilter === 'all' || (t.difficulty || 'medium') === testDifficultyFilter;
    const matchesRole = testRoleFilter === 'all' || (t.created_by_role || 'student') === testRoleFilter;

    return matchesSearch && matchesStatus && matchesDiff && matchesRole;
  });

  // Filtered Study Resources
  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      (r.subject_name && r.subject_name.toLowerCase().includes(resourceSearch.toLowerCase())) ||
      (r.topic_name && r.topic_name.toLowerCase().includes(resourceSearch.toLowerCase())) ||
      (r.source && r.source.toLowerCase().includes(resourceSearch.toLowerCase()));

    const matchesType = resourceTypeFilter === 'all' || r.type === resourceTypeFilter;
    const matchesSubject = resourceSubjectFilter === 'all' || r.subject_name === resourceSubjectFilter;

    return matchesSearch && matchesType && matchesSubject;
  });

  // Metrics
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const studentUsersCount = users.filter((u) => u.role === 'student').length;
  const superadminUsersCount = users.filter((u) => u.role === 'superadmin').length;
  const totalAttemptsCount = users.reduce((acc, u) => acc + (u.attempts_made || 0), 0);
  const publishedTestsCount = tests.filter((t) => (t.status || 'published') === 'published').length;
  const draftTestsCount = tests.filter((t) => t.status === 'draft').length;
  const pdfResourcesCount = resources.filter((r) => r.type === 'pdf').length;
  const videoResourcesCount = resources.filter((r) => r.type === 'youtube').length;
  const formulaResourcesCount = resources.filter((r) => r.type === 'formula').length;

  // 1. Loading state while checking active session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0C0D0E] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse mb-3">
          <Crown className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-white tracking-tight">Verifying Superadmin Authorization...</p>
        <p className="text-xs text-neutral-400 mt-1">Connecting to Platform Command Interface</p>
      </div>
    );
  }

  // 2. Authentication Gate
  if (!currentUser || currentUser.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-[#0A0B0D] text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500 selection:text-black relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#131418] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-[#0E0F12] rounded-2xl flex items-center justify-center">
                  <Crown className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#131418] flex items-center justify-center text-white">
                <Key className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Superadmin Restricted
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Platform Master Console
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
              Elevated credentials required to manage tests, curriculum resources, and platform infrastructure.
            </p>
          </div>

          {currentUser && (
            <div className="mb-5 p-3 rounded-lg bg-neutral-800/80 border border-neutral-700/80 text-xs text-neutral-300 flex items-center justify-between">
              <div className="truncate pr-2">
                <span className="text-neutral-400">Current session: </span>
                <span className="font-semibold text-white">{currentUser.name || currentUser.email}</span>
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-300 capitalize font-mono">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-medium shrink-0">Elevation Required</span>
            </div>
          )}

          {authError && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1 leading-relaxed">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSuperadminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Super Administrator Email
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="superadmin@examcraft.platform"
                required
                className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-neutral-700/80 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-neutral-700/80 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-transparent transition-all"
              />
            </div>

            <div className="p-2.5 rounded-md bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-neutral-400">Master Credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setAuthEmail('superadmin@examcraft.platform');
                  setAuthPassword('demo1234');
                }}
                className="text-[10px] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-mono transition-colors text-left"
              >
                superadmin@examcraft.platform / demo1234 (Autofill)
              </button>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-lg shadow-lg shadow-amber-500/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Authorization...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Authenticate & Enter Console
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <Link
              href="/dashboard"
              className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              &larr; Return to Learner Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEDICATED SUPERADMIN PLATFORM MASTER CONSOLE SHELL
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#1E2024] selection:bg-amber-500 selection:text-black">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2024] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <header className="bg-[#121316] text-white border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand & Console Badge */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1px] shadow-sm shadow-amber-500/20">
                <div className="w-full h-full bg-[#1A1B1F] rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">ExamCraft Platform</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                    Superadmin Ops
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    System Active
                  </span>
                  <span>•</span>
                  <span>SQLite WAL Engine</span>
                  <span>•</span>
                  <span>Gemini 3.6 Flash</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Session Controller */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateTestModal(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs shadow-sm shadow-amber-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Official Mock
              </button>

              <button
                onClick={() => setShowAddResourceModal(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg text-xs border border-white/10 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                Add Study Resource
              </button>

              <Link
                href="/library"
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-neutral-400 hover:text-white rounded-lg text-xs hover:bg-white/5 transition-colors"
                title="View student library page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Student Library
              </Link>

              <button
                onClick={async () => {
                  await fetch('/api/auth/demo?role=student', { method: 'POST' });
                  window.location.href = '/dashboard';
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs border border-neutral-700 transition-colors"
                title="Lock console and revert to student session"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Lock Console</span>
              </button>
            </div>
          </div>

          {/* SECONDARY HORIZONTAL MODULE TABS */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-neutral-800/80 text-xs no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Platform Overview
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'tests'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Tests & Mocks Control ({tests.length})
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'resources'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Study Resources Hub ({resources.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'users'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users & Institutes ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'sections'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Exam Sections ({sections.length})
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'system'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              System & AI Engine
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONSOLE BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5" /> Platform Health & Operations
                </div>
                <h2 className="text-2xl font-bold text-[#1E2024]">ExamCraft Central Infrastructure</h2>
                <p className="text-xs text-neutral-500 max-w-xl">
                  Centralized command console for test creation, curriculum material distribution, and multi-tenant user access governance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowCreateTestModal(true)}
                  className="px-3.5 py-2 bg-[#1E2024] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Mock Test
                </button>
                <button
                  onClick={() => setShowAddResourceModal(true)}
                  className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-[#1E2024] text-xs font-semibold rounded-lg border border-neutral-200 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-neutral-500" /> Add Resource
                </button>
              </div>
            </div>

            {/* Platform KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Platform Accounts</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-[#1E2024]">{users.length}</div>
                <div className="text-[11px] text-neutral-400">
                  {studentUsersCount} students, {adminUsersCount} institutes
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Mock Tests & Papers</span>
                  <Layers className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-[#1E2024]">{tests.length}</div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {publishedTestsCount} published live, {draftTestsCount} drafts
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Study Resources</span>
                  <BookOpen className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-[#1E2024]">{resources.length}</div>
                <div className="text-[11px] text-neutral-400">
                  {pdfResourcesCount} PDFs, {videoResourcesCount} videos, {formulaResourcesCount} formulas
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>Student Test Submissions</span>
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-[#1E2024]">{totalAttemptsCount}</div>
                <div className="text-[11px] text-neutral-400">Recorded platform attempts</div>
              </div>
            </div>

            {/* Quick Action Portals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('tests')}
                className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-[#1E2024] group-hover:text-amber-600 transition-colors">
                  Mock Tests & Papers &rarr;
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Review and edit platform test papers, customize question choices, adjust marks, or publish global tests for all students.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('resources')}
                className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-[#1E2024] group-hover:text-purple-600 transition-colors">
                  Study Resources Hub &rarr;
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Upload PDF handouts, video masterclasses, formula sheets, and study notes that automatically populate student libraries.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-[#1E2024] group-hover:text-blue-600 transition-colors">
                  User Accounts & Privileges &rarr;
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Escalate accounts between Student, Admin, and Superadmin roles, monitor coaching institutes, and handle suspensions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TESTS & MOCKS CONTROL */}
        {/* ========================================================================= */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#1E2024]">Platform Test & Mock Paper Management</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Full control over official test papers: modify questions, edit marking schemes, toggle live publication, or delete tests.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateTestModal(true)}
                  className="px-3.5 py-2 bg-[#1E2024] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Platform Mock
                </button>

                <Link
                  href="/tests/create"
                  className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#1E2024] text-xs font-medium rounded-lg border border-neutral-200 shadow-xs flex items-center gap-1.5 transition-colors"
                  title="Upload via PDF Mock Converter"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  PDF Converter
                </Link>

                <button
                  onClick={fetchTests}
                  className="p-2 border border-neutral-200 rounded-lg text-neutral-500 hover:text-[#1E2024] hover:bg-neutral-50 transition-colors"
                  title="Refresh tests list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search test by title, subject, or creator..."
                  value={testSearch}
                  onChange={(e) => setTestSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={testStatusFilter}
                  onChange={(e) => setTestStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] bg-white focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="published">🟢 Published Live</option>
                  <option value="draft">🟡 Draft Mode</option>
                </select>

                <select
                  value={testDifficultyFilter}
                  onChange={(e) => setTestDifficultyFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] bg-white focus:outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={testRoleFilter}
                  onChange={(e) => setTestRoleFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] bg-white focus:outline-none"
                >
                  <option value="all">All Creators</option>
                  <option value="superadmin">👑 Superadmin Mocks</option>
                  <option value="admin">🏫 Institute Tests</option>
                  <option value="student">🎓 Student Self-Practice</option>
                </select>
              </div>
            </div>

            {/* Test Cards List */}
            {loadingTests ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-neutral-200">
                <div className="w-6 h-6 border-2 border-[#1E2024] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading mock test library...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                No mock tests match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredTests.map((t) => {
                  const isPublished = (t.status || 'published') === 'published';
                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-xl border border-neutral-200/90 p-4 shadow-2xs hover:border-neutral-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {isPublished ? '● Published Live' : '○ Draft Mode'}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {t.subject || 'General'}
                          </span>

                          <span className="text-[10px] text-neutral-400 capitalize px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200">
                            {t.difficulty || 'medium'}
                          </span>

                          <span className="text-xs text-neutral-400">
                            Created by <strong className="text-neutral-700">{t.created_by_name || 'User'}</strong> ({t.created_by_role || 'student'})
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-[#1E2024]">{t.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Layers className="w-3.5 h-3.5 text-neutral-400" />
                            {t.question_count || 0} Questions
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {Math.floor((t.duration_seconds || 0) / 60)} mins
                          </span>
                          <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            {t.attempts_count || 0} Attempts Logged
                          </span>
                        </div>
                      </div>

                      {/* Superadmin Controls on Each Test */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                        {/* Status Toggle */}
                        <button
                          onClick={() => handleToggleTestStatus(t)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isPublished
                              ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                          title="Toggle between published and draft mode"
                        >
                          {isPublished ? 'Unpublish' : 'Make Live'}
                        </button>

                        {/* Modify / Edit Button */}
                        <button
                          onClick={() => handleOpenEditTest(t)}
                          className="px-3 py-1.5 bg-[#1E2024] hover:bg-black text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Modify Test
                        </button>

                        {/* Inspect link */}
                        <Link
                          href={`/tests/${t.id}`}
                          className="p-2 border border-neutral-200 text-neutral-500 hover:text-[#1E2024] hover:bg-neutral-50 rounded-lg text-xs transition-colors"
                          title="Inspect test paper"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteTest(t.id)}
                          className="p-2 border border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs transition-colors"
                          title="Delete test permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STUDY RESOURCES HUB */}
        {/* ========================================================================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#1E2024]">Platform Study Resources & Library Hub</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Publish and manage reference materials, PDF formula books, video masterclasses, and revision guides for all enrolled students.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddResourceModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Study Resource
                </button>

                <Link
                  href="/library"
                  className="px-3 py-2 bg-white hover:bg-neutral-50 text-[#1E2024] text-xs font-medium rounded-lg border border-neutral-200 shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                  View Student Library
                </Link>

                <button
                  onClick={fetchResources}
                  className="p-2 border border-neutral-200 rounded-lg text-neutral-500 hover:text-[#1E2024] hover:bg-neutral-50 transition-colors"
                  title="Refresh resources list"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search resources by title, topic, subject, or source..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={resourceTypeFilter}
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] bg-white focus:outline-none"
                >
                  <option value="all">All Formats</option>
                  <option value="pdf">📄 PDF Document</option>
                  <option value="youtube">📺 Video Lecture</option>
                  <option value="formula">⚡ Formula Sheet</option>
                  <option value="notes">📝 Study Notes</option>
                  <option value="article">📰 Reading Article</option>
                  <option value="website">🌐 Web Resource</option>
                </select>

                <select
                  value={resourceSubjectFilter}
                  onChange={(e) => setResourceSubjectFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] bg-white focus:outline-none"
                >
                  <option value="all">All Subjects</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                  <option value="Data Interpretation">Data Interpretation</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="General Awareness">General Awareness</option>
                </select>
              </div>
            </div>

            {/* Resources List */}
            {loadingResources ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-neutral-200">
                <div className="w-6 h-6 border-2 border-[#1E2024] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading study resources...
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                No study resources match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((res) => {
                  let typeBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  let TypeIcon = FileText;
                  if (res.type === 'pdf') {
                    typeBadgeColor = 'bg-red-50 text-red-700 border-red-200';
                    TypeIcon = FileText;
                  } else if (res.type === 'youtube') {
                    typeBadgeColor = 'bg-red-50 text-red-600 border-red-200';
                    TypeIcon = Youtube;
                  } else if (res.type === 'formula') {
                    typeBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                    TypeIcon = Zap;
                  } else if (res.type === 'notes') {
                    typeBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    TypeIcon = StickyNote;
                  }

                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-xl border border-neutral-200/90 p-4 shadow-2xs hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${typeBadgeColor}`}>
                            <TypeIcon className="w-3 h-3" />
                            {res.type.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-medium">
                            {res.subject_name || 'General'}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-[#1E2024] leading-snug">{res.title}</h4>

                        {res.topic_name && (
                          <div className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                            <span>Chapter:</span>
                            <span className="text-neutral-700">{res.topic_name}</span>
                          </div>
                        )}

                        {res.notes && (
                          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                            {res.notes}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-neutral-400">
                          By <strong className="text-neutral-600">{res.source || 'Platform Editorial'}</strong>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 border border-neutral-200 text-neutral-500 hover:text-[#1E2024] hover:bg-neutral-50 rounded-lg text-xs transition-colors"
                              title="Open resource link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handleOpenEditResource(res)}
                            className="p-1.5 border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg text-xs transition-colors"
                            title="Edit resource"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-1.5 border border-red-200 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs transition-colors"
                            title="Delete resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: USER & INSTITUTE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#1E2024]">User Accounts & Organization Access</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage roles, permissions, and access states across students, coaching academies, and administrators.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  className="p-2 border border-neutral-200 rounded-lg text-neutral-500 hover:text-[#1E2024] hover:bg-neutral-50 transition-colors text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search users by name, email, or institute..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-2.5 py-1.5 border border-neutral-200 rounded-lg text-xs text-[#1E2024] bg-white focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="admin">Administrators</option>
                <option value="superadmin">Superadmins</option>
              </select>
            </div>

            {/* Table */}
            {loadingUsers ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-neutral-200">
                <div className="w-6 h-6 border-2 border-[#1E2024] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading platform users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                No users match criteria.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-neutral-200/90 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Account & Name</th>
                        <th className="px-3 py-3">Role & Privilege</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Activity</th>
                        <th className="px-3 py-3">Created</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/80">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs border ${
                                  u.role === 'superadmin'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : u.role === 'admin'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                }`}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#1E2024]">{u.name}</p>
                                <p className="text-[11px] text-neutral-400">{u.email}</p>
                                {u.institute_name && (
                                  <p className="text-[10px] text-amber-700 font-medium mt-0.5">
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
                              className="px-2 py-1 border border-neutral-200 rounded-md text-xs font-medium bg-white text-[#1E2024] focus:outline-none"
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
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              {u.status === 'active' ? '✓ Active' : '✕ Suspended'}
                            </button>
                          </td>

                          <td className="px-3 py-3 text-neutral-500 text-[11px]">
                            <div><strong className="text-[#1E2024]">{u.tests_created}</strong> tests</div>
                            <div><strong className="text-[#1E2024]">{u.attempts_made}</strong> attempts</div>
                          </td>

                          <td className="px-3 py-3 text-neutral-400 font-mono text-[11px]">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-4 py-3 text-right">
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
                                className="p-1.5 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 rounded-md text-xs transition-colors"
                                title="Edit user profile"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === currentUser?.id}
                                className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-md text-xs transition-colors disabled:opacity-30"
                                title="Delete user"
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

        {/* ========================================================================= */}
        {/* TAB 5: EXAM CATEGORIES & SECTIONS */}
        {/* ========================================================================= */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-[#1E2024]">Exam Categories & Subject Sections</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Organize tests into global test categories (e.g. CAT, XAT, GMAT, Banking) or subject sections.
                </p>
              </div>

              <button
                onClick={() => setShowAddSectionModal(true)}
                className="px-3.5 py-2 bg-[#1E2024] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Add Exam Section
              </button>
            </div>

            {loadingSections ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-neutral-200">
                Loading sections...
              </div>
            ) : sections.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                No exam sections configured.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-[#1E2024]">{sec.name}</h4>
                        <button
                          onClick={() => handleToggleSection(sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            sec.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                          }`}
                        >
                          {sec.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {sec.description || 'Global exam section for curriculum and test grouping.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                      <span className="font-mono text-[11px]">{new Date(sec.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
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

        {/* ========================================================================= */}
        {/* TAB 6: SYSTEM & AI ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1E2024]">Google Gemini AI Pipeline</h3>
                  <p className="text-xs text-neutral-500">Autonomous test parser & diagnostic analysis</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-neutral-500">Active LLM Model:</span>
                  <span className="font-mono font-bold text-[#1E2024]">gemini-3.6-flash</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-neutral-500">Execution Status:</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Online & Ready
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-neutral-500">Secret Management:</span>
                  <span className="font-mono text-[11px] text-neutral-700">Environment (`GEMINI_API_KEY`)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1E2024]">Storage & Database Engine</h3>
                  <p className="text-xs text-neutral-500">High-concurrency SQLite storage in WAL mode</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-neutral-500">Engine Type:</span>
                  <span className="font-bold text-[#1E2024]">Node.js SQLite3 (WAL Mode)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-neutral-500">Database Path:</span>
                  <span className="font-mono text-[11px] text-neutral-700">./data/mocktest.db</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-neutral-500">Foreign Keys Enforcement:</span>
                  <span className="font-medium text-emerald-600">Enabled (PRAGMA foreign_keys = ON)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: EDIT / MODIFY TEST & QUESTIONS */}
      {/* ========================================================================= */}
      {editingTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-2xl">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                    Superadmin Test Editor
                  </span>
                  <span className="text-xs text-neutral-400">ID: {editingTest.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#1E2024]">Modify Test & Question Paper</h3>
              </div>
              <button
                onClick={() => setEditingTest(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveTestModification} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Basic Meta Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Test Title</label>
                  <input
                    type="text"
                    value={editTestTitle}
                    onChange={(e) => setEditTestTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Subject / Category</label>
                  <input
                    type="text"
                    value={editTestSubject}
                    onChange={(e) => setEditTestSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={editTestDurationMins}
                    onChange={(e) => setEditTestDurationMins(Number(e.target.value))}
                    min={1}
                    max={360}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Difficulty Level</label>
                  <select
                    value={editTestDifficulty}
                    onChange={(e) => setEditTestDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Publication Status</label>
                  <select
                    value={editTestStatus}
                    onChange={(e) => setEditTestStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="published">🟢 Published (Visible to all students)</option>
                    <option value="draft">🟡 Draft (Hidden from students)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Description / Instructions</label>
                  <textarea
                    rows={2}
                    value={editTestDescription}
                    onChange={(e) => setEditTestDescription(e.target.value)}
                    placeholder="Provide exam pattern details, syllabus coverage, or guidance..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Question Editor Section */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1E2024]">
                      Questions ({editTestQuestions.length})
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Edit questions, change multiple choice options, select the correct answer, and provide explanations.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addQuestionToList(editTestQuestions, setEditTestQuestions)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                {loadingTestDetails ? (
                  <div className="p-8 text-center text-neutral-400">Loading question set...</div>
                ) : editTestQuestions.length === 0 ? (
                  <div className="p-8 text-center text-neutral-400 bg-neutral-50 rounded-xl border border-dashed">
                    No questions in this test. Click "Add Question" to start.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editTestQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-700 text-xs flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px]">
                              {qIdx + 1}
                            </span>
                            Question {qIdx + 1}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeQuestionFromList(editTestQuestions, setEditTestQuestions, qIdx)}
                            className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                            title="Remove question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <div>
                          <input
                            type="text"
                            value={q.question_text}
                            onChange={(e) =>
                              updateQuestionInList(editTestQuestions, setEditTestQuestions, qIdx, 'question_text', e.target.value)
                            }
                            required
                            placeholder="Type question prompt..."
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                            <div key={letter} className="flex items-center gap-2">
                              <span
                                onClick={() =>
                                  updateQuestionInList(editTestQuestions, setEditTestQuestions, qIdx, 'correct_answer', letter)
                                }
                                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs cursor-pointer border transition-colors shrink-0 ${
                                  q.correct_answer === letter
                                    ? 'bg-emerald-500 text-white border-emerald-600'
                                    : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                                }`}
                                title={`Click to mark ${letter} as correct answer`}
                              >
                                {letter}
                              </span>
                              <input
                                type="text"
                                value={q.options[optIdx] || ''}
                                onChange={(e) =>
                                  updateOptionInQuestion(editTestQuestions, setEditTestQuestions, qIdx, optIdx, e.target.value)
                                }
                                required
                                placeholder={`Option ${letter}`}
                                className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <div>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) =>
                              updateQuestionInList(editTestQuestions, setEditTestQuestions, qIdx, 'explanation', e.target.value)
                            }
                            placeholder="Explanation / solution details (shown to students in test review)..."
                            className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] text-neutral-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTest(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTest}
                  className="px-5 py-2 bg-[#1E2024] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {savingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE OFFICIAL MOCK TEST */}
      {/* ========================================================================= */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-2xl">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  Platform Official Mock Builder
                </span>
                <h3 className="text-base font-bold text-[#1E2024]">Create Platform Mock Test</h3>
              </div>
              <button
                onClick={() => setShowCreateTestModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewTest} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Test Title</label>
                  <input
                    type="text"
                    value={newTestTitle}
                    onChange={(e) => setNewTestTitle(e.target.value)}
                    required
                    placeholder="e.g. Official National Full-Length Mock 01 (2026)"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Subject / Section</label>
                  <input
                    type="text"
                    value={newTestSubject}
                    onChange={(e) => setNewTestSubject(e.target.value)}
                    required
                    placeholder="e.g. Full Length Mock, QA, VARC, DILR"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newTestDurationMins}
                    onChange={(e) => setNewTestDurationMins(Number(e.target.value))}
                    min={5}
                    max={360}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Difficulty Level</label>
                  <select
                    value={newTestDifficulty}
                    onChange={(e) => setNewTestDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Publication Status</label>
                  <select
                    value={newTestStatus}
                    onChange={(e) => setNewTestStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="published">🟢 Published Live</option>
                    <option value="draft">🟡 Save as Draft</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">Test Description / Instructions</label>
                  <textarea
                    rows={2}
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    placeholder="Test guidelines, sectional time splits, or scoring instructions..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Questions */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#1E2024]">
                      Add Questions ({newTestQuestions.length})
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Configure question prompts, multiple choice options, and correct answers.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addQuestionToList(newTestQuestions, setNewTestQuestions)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {newTestQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-700 text-xs">Question {qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeQuestionFromList(newTestQuestions, setNewTestQuestions, qIdx)}
                          className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={q.question_text}
                        onChange={(e) =>
                          updateQuestionInList(newTestQuestions, setNewTestQuestions, qIdx, 'question_text', e.target.value)
                        }
                        required
                        placeholder="Type question prompt..."
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-none"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                          <div key={letter} className="flex items-center gap-2">
                            <span
                              onClick={() =>
                                updateQuestionInList(newTestQuestions, setNewTestQuestions, qIdx, 'correct_answer', letter)
                              }
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs cursor-pointer border transition-colors shrink-0 ${
                                q.correct_answer === letter
                                  ? 'bg-emerald-500 text-white border-emerald-600'
                                  : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                              }`}
                              title={`Click to mark ${letter} as correct`}
                            >
                              {letter}
                            </span>
                            <input
                              type="text"
                              value={q.options[optIdx] || ''}
                              onChange={(e) =>
                                updateOptionInQuestion(newTestQuestions, setNewTestQuestions, qIdx, optIdx, e.target.value)
                              }
                              required
                              placeholder={`Option ${letter}`}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) =>
                          updateQuestionInList(newTestQuestions, setNewTestQuestions, qIdx, 'explanation', e.target.value)
                        }
                        placeholder="Explanation / step-by-step solution..."
                        className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-[11px] text-neutral-600 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTestModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTest}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {creatingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Create & Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD STUDY RESOURCE */}
      {/* ========================================================================= */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-2xl">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                  Curriculum Asset Manager
                </span>
                <h3 className="text-base font-bold text-[#1E2024]">Add New Study Resource</h3>
              </div>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  required
                  placeholder="e.g. Complete Arithmetic & Percentage Formulas Handbook"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Resource Format</label>
                  <select
                    value={newResType}
                    onChange={(e) => setNewResType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="pdf">📄 PDF Document / Handout</option>
                    <option value="youtube">📺 Video Lecture / Masterclass</option>
                    <option value="formula">⚡ Formula & Shortcut Sheet</option>
                    <option value="notes">📝 High-Yield Revision Notes</option>
                    <option value="article">📰 Reading & Analysis Article</option>
                    <option value="website">🌐 Curated Web Reference</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newResSubject}
                    onChange={(e) => setNewResSubject(e.target.value)}
                    required
                    placeholder="e.g. Quantitative Aptitude"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Chapter / Topic</label>
                  <input
                    type="text"
                    value={newResTopic}
                    onChange={(e) => setNewResTopic(e.target.value)}
                    placeholder="e.g. Percentages & Profit Loss"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Author / Source Attribution</label>
                  <input
                    type="text"
                    value={newResSource}
                    onChange={(e) => setNewResSource(e.target.value)}
                    placeholder="e.g. Platform Editorial Board"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">External Resource URL / Link</label>
                <input
                  type="url"
                  value={newResUrl}
                  onChange={(e) => setNewResUrl(e.target.value)}
                  placeholder="https://... (PDF link, YouTube video URL, or document drive)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Detailed Content / Study Notes</label>
                <textarea
                  rows={4}
                  value={newResNotes}
                  onChange={(e) => setNewResNotes(e.target.value)}
                  placeholder="Write formulas, study notes, or markdown content that students can read directly in the application..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingResource}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {creatingResource ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Publish to Student Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT STUDY RESOURCE */}
      {/* ========================================================================= */}
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-t-2xl">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                  Modify Curriculum Asset
                </span>
                <h3 className="text-base font-bold text-[#1E2024]">Edit Study Resource</h3>
              </div>
              <button
                onClick={() => setEditingResource(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveResourceEdit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  value={editResTitle}
                  onChange={(e) => setEditResTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Resource Format</label>
                  <select
                    value={editResType}
                    onChange={(e) => setEditResType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="pdf">📄 PDF Document / Handout</option>
                    <option value="youtube">📺 Video Lecture / Masterclass</option>
                    <option value="formula">⚡ Formula & Shortcut Sheet</option>
                    <option value="notes">📝 High-Yield Revision Notes</option>
                    <option value="article">📰 Reading & Analysis Article</option>
                    <option value="website">🌐 Curated Web Reference</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editResSubject}
                    onChange={(e) => setEditResSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Chapter / Topic</label>
                  <input
                    type="text"
                    value={editResTopic}
                    onChange={(e) => setEditResTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Source Attribution</label>
                  <input
                    type="text"
                    value={editResSource}
                    onChange={(e) => setEditResSource(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Resource Link / URL</label>
                <input
                  type="url"
                  value={editResUrl}
                  onChange={(e) => setEditResUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Content / Study Notes</label>
                <textarea
                  rows={4}
                  value={editResNotes}
                  onChange={(e) => setEditResNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingResource}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {updatingResource ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-sm font-bold text-[#1E2024]">Edit User Credentials</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Platform Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="student">🎓 Student / Learner</option>
                  <option value="admin">🏫 Coaching Academy Administrator</option>
                  <option value="superadmin">👑 Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Coaching Institute Name</label>
                <input
                  type="text"
                  value={editInstitute}
                  onChange={(e) => setEditInstitute(e.target.value)}
                  placeholder="e.g. Apex Medical & Engineering Academy"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Reset Password <span className="font-normal text-neutral-400">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-5 py-2 bg-[#1E2024] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {updatingUser ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SECTION */}
      {/* ========================================================================= */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="text-sm font-bold text-[#1E2024]">Add New Exam Section</h3>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Section / Category Name</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                  placeholder="e.g. Quantitative Aptitude & Data Interpretation"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  placeholder="Outline topics covered or target exams..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSection}
                  className="px-5 py-2 bg-[#1E2024] hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {creatingSection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
