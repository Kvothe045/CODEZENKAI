// lib/database.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database connection for Neon PostgreSQL
const connectionString = process.env.DATABASE_URL!;

// Types
export interface User {
  id: string;
  name: string;
  uid?: string;
  codeforces_username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  highest_ranking?: number;
  current_ranking?: number;
}

export interface Contest {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  problems: string[];
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  contest_id: string;
  problem_index: number;
  verdict: string;
  submission_time: string;
  attempts: number;
  time_taken: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  contest_id: string;
  event_type: string;
  timestamp: string;
  details: any;
}

export interface UserRanking {
  user_id: string;
  contest_id: string;
  rank: number;
  problems_solved: number;
  total_penalty: number;
  total_time: number;
}
