export type UserRole = 'student' | 'learner' | 'creator' | 'educator' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  active_role?: UserRole;
  status?: 'active' | 'suspended';
  institute_name?: string | null;
  created_at: string;
}

export interface Section {
  id: string;
  name: string;
  description: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface QuestionOption {
  label: string; // 'A', 'B', 'C', 'D', etc.
  text: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_number: number;
  question_text: string;
  question_image_url?: string | null;
  question_type: 'single' | 'multiple';
  options: QuestionOption[];
  correct_answer: string; // 'A' or 'A,B'
  correct_marks: number;
  negative_marks: number;
  unanswered_marks: number;
  explanation?: string | null;
  parsing_confidence?: number;
  subject_id?: string | null;
  section_id?: string | null;
  topic_id?: string | null;
  subtopic_id?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  source?: string | null;
  tags?: string[];
  estimated_solving_time_seconds?: number;
  created_at?: string;
  updated_at?: string;
}

export type TestType =
  | 'topic_test'
  | 'subtopic_test'
  | 'chapter_test'
  | 'sectional_test'
  | 'subject_test'
  | 'full_mock'
  | 'previous_year_paper'
  | 'mixed_revision_test'
  | 'custom_test'
  | 'community_test'
  | 'educator_test'
  | 'test_series'
  | 'custom_practice';

export interface Test {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  section_id?: string | null;
  duration_seconds: number; // 0 = no time limit
  marking_scheme_type: 'standard' | 'custom';
  default_correct_marks: number;
  default_negative_marks: number;
  default_unanswered_marks: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  allow_navigation: boolean;
  show_palette: boolean;
  allow_review_marking: boolean;
  show_immediate_results: boolean;
  tags?: string[];
  test_type?: TestType;
  exam_id?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  subtopic_id?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  source?: string;
  visibility?: 'private' | 'unlisted' | 'shared' | 'public';
  is_paid?: boolean;
  price_inr?: number;
  status?: 'draft' | 'under_review' | 'published' | 'revisions_requested' | 'rejected';
  series_id?: string | null;
  review_notes?: string | null;
  has_access?: boolean;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at: string;
  // Computed aggregations
  created_by_name?: string;
  created_by_role?: UserRole;
  creator_institute?: string;
  question_count?: number;
  attempts_count?: number;
  best_score?: number | null;
  last_attempted_at?: string | null;
  last_attempt_status?: string | null;
  last_attempt_id?: string | null;
}

export interface SectionPerformance {
  section_id?: string;
  section_name: string;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  positive_marks: number;
  negative_marks: number;
  score: number;
  accuracy: number;
}

export interface TopicPerformance {
  topic_id: string;
  topic_title: string;
  subject_name?: string;
  total_questions: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  status_updated_to?: string;
  is_mastered?: boolean;
}

export type QuestionPaletteState = 
  | 'not_visited'
  | 'visited_unanswered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked';

export interface UserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  question_number: number;
  selected_answer: string | null; // e.g. 'A' or null
  is_correct: boolean | null;
  marks_awarded: number;
  negative_marks_deducted: number;
  is_marked_for_review: boolean;
  answered_at?: string;
}

export interface AIInsights {
  overall_feedback: string;
  strengths: string[];
  weak_areas: string[];
  time_management: string;
  recommended_topics: string[];
  accuracy_assessment: string;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  test_title_snapshot: string;
  duration_seconds: number;
  started_at: string;
  submitted_at: string | null;
  time_taken_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  total_questions: number;
  attempted_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  positive_marks: number;
  negative_marks: number;
  final_score: number;
  maximum_marks: number;
  percentage: number;
  accuracy: number;
  questions_snapshot_json?: string; // serialized Question[]
  ai_insights_json?: string | null;
  created_at: string;
  answers?: UserAnswer[];
  user_name?: string;
  user_email?: string;
}

export interface ExtractedQuestion {
  question_number: number;
  question_text: string;
  options: QuestionOption[];
  correct_answer?: string;
  correct_marks?: number;
  negative_marks?: number;
  explanation?: string;
  confidence: number;
  warnings?: string[];
}

export interface ParseResult {
  questions: ExtractedQuestion[];
  detected_key_count: number;
  matched_key_count: number;
  warnings: string[];
  raw_text_preview?: string;
}

// ==========================================
// Nalanda Domain Architecture Models
// ==========================================

export type ExamCategory =
  | 'medical'
  | 'engineering'
  | 'civil_services'
  | 'general_science'
  | 'banking'
  | 'other';

export interface Exam {
  id: string;
  code: string; // e.g. 'CAT_2026', 'XAT_2026', 'NMAT_2026', 'SNAP_2026'
  title: string;
  category: ExamCategory | string;
  description: string;
  target_year: number;
  pattern_type: 'single_paper' | 'multi_subject' | 'stage_based';
  total_marks: number;
  total_duration_minutes: number;
  is_active: boolean;
  conducting_body?: string;
  difficulty_level?: string;
  pattern_summary?: string;
  created_at: string;
  // Computed aggregations
  subjects_count?: number;
  topics_count?: number;
  tests_count?: number;
}

export type PreparationStage = 'beginner' | 'intermediate' | 'revision_mocks';
export type TargetTimeline = '2026_tier1' | '3_months' | '6_months' | '12_months';
export type DiagnosticTestStatus = 'pending' | 'completed' | 'skipped';

export interface UserOnboardingProfile {
  user_id: string;
  preferred_exam_id: string;
  preparation_stage: PreparationStage;
  target_timeline: TargetTimeline;
  daily_study_hours: number;
  strong_subjects_json: string;
  weak_subjects_json: string;
  diagnostic_test_status: DiagnosticTestStatus;
  completed_at: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  exam_id: string;
  name: string;
  code: string;
  order_index: number;
  description?: string | null;
  color_accent?: string | null;
  created_at: string;
  // Computed aggregations
  topics_count?: number;
  tests_count?: number;
}

export type SyllabusNodeLevel = 'section' | 'unit' | 'chapter' | 'topic' | 'subtopic';

export interface SyllabusNode {
  id: string;
  subject_id: string;
  parent_id?: string | null;
  level: SyllabusNodeLevel;
  title: string;
  code?: string | null;
  order_index: number;
  estimated_study_hours: number;
  weightage_percentage: number;
  prerequisite_ids: string[]; // parsed array of topic IDs
  description?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
  // Computed aggregations for learner view
  resources_count?: number;
  tests_count?: number;
  user_status?: 'not_started' | 'in_progress' | 'studied' | 'mastered' | 'revision_due';
  user_mastery?: number;
  revision_status?: 'due' | 'up_to_date' | 'scheduled';
  next_revision_date?: string | null;
  subtopics?: SyllabusNode[];
  prerequisite_nodes?: { id: string; title: string; status?: string }[];
}

export interface TopicResource {
  id: string;
  topic_id: string;
  title: string;
  resource_type: 'notes' | 'cheat_sheet' | 'formula_digest' | 'video_ref' | 'syllabus_guide';
  content_summary: string;
  external_url?: string | null;
  estimated_read_minutes: number;
  created_at: string;
}

export interface UserExamEnrollment {
  id: string;
  user_id: string;
  exam_id: string;
  target_year: number;
  target_score?: number | null;
  is_primary: boolean;
  enrolled_at: string;
  // Enriched fields
  exam_title?: string;
  exam_code?: string;
  exam_category?: string;
}

export interface UserTopicProgress {
  id: string;
  user_id: string;
  topic_id: string;
  status: 'not_started' | 'in_progress' | 'studied' | 'mastered' | 'revision_due';
  mastery_percentage: number; // 0 - 100
  questions_practiced: number;
  questions_correct: number;
  tests_attempted: number;
  last_studied_at?: string | null;
  notes_taken?: string | null;
  next_revision_date?: string | null;
  repetition_interval_days?: number;
  repetition_count?: number;
  is_bookmarked?: boolean;
  updated_at: string;
}

export interface KeyConcept {
  id: string;
  title: string;
  definition: string;
  formula?: string;
  importance?: 'core' | 'high_yield' | 'advanced';
}

export interface WorkedExample {
  id: string;
  title: string;
  problem_statement: string;
  examiner_angle: string;
  steps: { step_number: number; explanation: string; equation?: string }[];
  final_answer: string;
  pro_tip?: string;
}

export interface CommonMistake {
  id: string;
  mistake_title: string;
  error_trap: string;
  correct_approach: string;
  prevention_rule: string;
}

export interface PYQReference {
  id: string;
  exam: string;
  year: number;
  tier_or_stage: string;
  frequency_rating: 'very_high' | 'high' | 'moderate';
  question_summary: string;
}

export interface ActiveRecallCheck {
  id: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  recall_hint: string;
}

export interface DiagramTableData {
  title: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface TopicContent {
  topic_id: string;
  topic_title: string;
  subject_name: string;
  estimated_read_minutes: number;
  learning_objectives: string[];
  prerequisites: { id: string; title: string; is_completed: boolean }[];
  overview: string;
  key_concepts: KeyConcept[];
  tables?: DiagramTableData[];
  worked_examples: WorkedExample[];
  common_mistakes: CommonMistake[];
  pyq_references: PYQReference[];
  active_recall_checks: ActiveRecallCheck[];
  recap_points: string[];
  recommended_sectional_test?: { id: string; title: string; duration_minutes: number } | null;
}

export interface UserReadiness {
  exam_id: string;
  exam_title: string;
  syllabus_coverage_pct: number;
  overall_accuracy_pct: number;
  total_tests_completed: number;
  predicted_readiness_score: number; // 0 - 100
  readiness_tier: 'Foundation' | 'Progressing' | 'Exam Ready' | 'Advanced Mastery';
  strong_topics: string[];
  revision_needed_topics: string[];
  last_updated_at: string;
}

export interface QuestionBankItem {
  id: string;
  creator_id: string;
  topic_id?: string | null;
  subject_id?: string | null;
  exam_id?: string | null;
  question_text: string;
  question_type: 'single' | 'multiple';
  options: QuestionOption[];
  correct_answer: string;
  explanation?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  source_reference?: string | null;
  tags: string[];
  usage_count: number;
  created_at: string;
}

export interface EducatorProfile {
  user_id: string;
  name: string;
  email: string;
  headline: string;
  bio: string;
  institute_name?: string | null;
  profile_image_url?: string | null;
  verification_status: 'unverified' | 'pending' | 'verified';
  specialization_subjects: string[];
  total_students: number;
  average_rating: number;
  published_tests_count: number;
  draft_tests_count?: number;
  followers_count?: number;
  free_resources_count?: number;
  paid_resources_count?: number;
  publication_status?: 'active' | 'paused' | 'under_review';
  created_at: string;
}

export interface ExamStage {
  id: string;
  exam_id: string;
  name: string; // e.g. "Tier-I (CBE)", "Tier-II (Paper-I)"
  stage_number: number;
  total_marks: number;
  total_questions: number;
  duration_minutes: number;
  is_computer_based: boolean;
  description?: string | null;
  created_at: string;
}

export interface LearningPath {
  id: string;
  exam_id: string;
  title: string;
  description: string;
  target_days: number;
  recommended_hours_per_week: number;
  total_units: number;
  created_at: string;
}

export interface LearningUnit {
  id: string;
  path_id: string;
  topic_id: string;
  order_index: number;
  is_core: boolean;
  estimated_minutes: number;
  topic_title?: string;
  subject_name?: string;
}

export type MistakeCategory =
  | 'conceptual_gap'
  | 'calculation_error'
  | 'misread'
  | 'time_rush'
  | 'unfamiliar_pattern'
  | 'formula_slip';

export interface MistakeRecord {
  id: string;
  user_id: string;
  test_id: string;
  question_id: string;
  exam_id?: string | null;
  subject_id?: string | null;
  topic_id?: string | null;
  question_text: string;
  options: QuestionOption[];
  selected_answer: string;
  correct_answer: string;
  explanation?: string | null;
  error_category: MistakeCategory;
  user_notes?: string | null;
  is_resolved: boolean;
  resolved_at?: string | null;
  created_at: string;
  // Computed helpers
  topic_title?: string;
  subject_name?: string;
  test_title?: string;
}

export interface PerformanceRecord {
  id: string;
  user_id: string;
  exam_id: string;
  subject_id?: string | null;
  overall_score: number;
  maximum_score: number;
  accuracy_percentage: number;
  speed_questions_per_minute: number;
  percentile_rank: number;
  benchmark_comparison: string;
  recorded_at: string;
}

export interface TestSeries {
  id: string;
  creator_id: string;
  exam_id: string;
  title: string;
  description: string;
  target_year: number;
  total_tests: number;
  is_paid: boolean;
  price_inr: number;
  rating: number;
  enrolled_count: number;
  status: 'draft' | 'under_review' | 'published' | 'archived';
  visibility?: 'public' | 'unlisted' | 'private';
  creator_name?: string;
  creator_institute?: string;
  exam_title?: string;
  free_preview_count?: number;
  items?: TestSeriesItem[];
  has_access?: boolean;
  user_progress?: {
    completed_tests_count: number;
    progress_percentage: number;
    access_tier: string;
  };
  created_at: string;
}

export interface TestSeriesItem {
  id: string;
  series_id: string;
  test_id: string;
  sequence_order: number;
  is_free_preview: boolean;
  unlock_rule: 'immediate' | 'previous_completed' | 'date_scheduled';
  // Computed helpers
  test_title?: string;
  duration_seconds?: number;
  question_count?: number;
  difficulty?: string;
  is_attempted?: boolean;
  score?: number | null;
  created_at: string;
}

export interface UserSeriesEnrollment {
  id: string;
  user_id: string;
  series_id: string;
  access_tier: 'free_preview' | 'paid' | 'granted';
  payment_order_id?: string | null;
  progress_percentage: number;
  completed_tests_count: number;
  enrolled_at: string;
  last_activity_at?: string | null;
  // Computed helpers
  series_title?: string;
  exam_title?: string;
  total_tests?: number;
  next_test_id?: string | null;
}

export interface Publication {
  id: string;
  series_id: string;
  creator_id: string;
  pricing_tier: 'free' | 'tier_standard' | 'tier_pro';
  price_inr: number;
  discount_percentage?: number;
  visibility: 'public' | 'unlisted' | 'private' | 'institutional';
  is_monetized: boolean;
  published_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'mock_gateway';
export type ItemType = 'test' | 'test_series' | 'subscription';

export interface Order {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  amount_inr: number;
  platform_fee_inr: number;
  creator_earnings_inr: number;
  tax_inr: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod | string;
  gateway_transaction_id?: string | null;
  receipt_number: string;
  item_title?: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
  completed_at?: string | null;
}

export interface Purchase {
  id: string;
  order_id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  access_status: 'active' | 'revoked' | 'expired';
  granted_at: string;
  expires_at?: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  creator_id?: string | null;
  tier_code: 'monthly' | 'quarterly' | 'annual';
  amount_inr: number;
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  started_at: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Refund {
  id: string;
  order_id: string;
  user_id: string;
  amount_inr: number;
  reason: string;
  status: 'requested' | 'approved' | 'processed' | 'rejected';
  requested_at: string;
  processed_at?: string | null;
}

export interface CreatorPayout {
  id: string;
  creator_id: string;
  period_start: string;
  period_end: string;
  gross_sales_inr: number;
  platform_fee_deducted_inr: number;
  tax_withheld_inr: number;
  net_payout_inr: number;
  status: 'accrued' | 'processing' | 'paid' | 'on_hold';
  payout_method: 'bank_transfer' | 'upi';
  payout_reference?: string | null;
  created_at: string;
  paid_at?: string | null;
}

export interface PlatformFee {
  id: string;
  fee_tier_name: string;
  platform_commission_pct: number;
  payment_gateway_fee_pct: number;
  tax_gst_pct: number;
  is_active: boolean;
  effective_from: string;
}

export interface ReviewQueueItem {
  id: string;
  item_type: 'test' | 'test_series';
  item_id: string;
  title: string;
  creator_id: string;
  creator_name: string;
  creator_email: string;
  creator_institute?: string | null;
  subject?: string;
  exam_id?: string | null;
  exam_title?: string;
  question_count?: number;
  is_paid: boolean;
  price_inr: number;
  submitted_at: string;
  status: 'under_review' | 'revisions_requested' | 'approved' | 'rejected';
  admin_notes?: string | null;
}

export interface LearnerResource {
  id: string;
  user_id?: string | null;
  title: string;
  type: 'youtube' | 'pdf' | 'article' | 'website' | 'notes';
  subject_id?: string | null;
  subject_name?: string | null;
  topic_id?: string | null;
  topic_name?: string | null;
  source?: string | null;
  url?: string | null;
  notes?: string | null;
  is_saved: boolean | number;
  created_at: string;
}

