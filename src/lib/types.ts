export type UserRole = 'student' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  created_at?: string;
  updated_at?: string;
}

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
  created_at: string;
  updated_at: string;
  // Computed aggregations
  created_by_name?: string;
  created_by_role?: UserRole;
  question_count?: number;
  attempts_count?: number;
  best_score?: number | null;
  last_attempted_at?: string | null;
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
