import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          bio: string;
          location: string;
          current_streak: number;
          longest_streak: number;
          total_points: number;
          level: number;
          settings: {
            notifications: {
              email: boolean;
              push: boolean;
            };
            privacy: {
              profile_visible: boolean;
              show_on_leaderboard: boolean;
            };
            appearance: {
              theme: string;
              language: string;
            };
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          avatar_url?: string | null;
          bio?: string;
          location?: string;
          current_streak?: number;
          longest_streak?: number;
          total_points?: number;
          level?: number;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          bio?: string;
          location?: string;
          current_streak?: number;
          longest_streak?: number;
          total_points?: number;
          level?: number;
          settings?: any;
          updated_at?: string;
        };
      };
      waste_logs: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          quantity: number;
          reason: string;
          date: string;
          notes: string;
          image_url: string | null;
          ai_analyzed: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          category: string;
          quantity: number;
          reason: string;
          date?: string;
          notes?: string;
          image_url?: string | null;
          ai_analyzed?: boolean;
        };
        Update: {
          category?: string;
          quantity?: number;
          reason?: string;
          date?: string;
          notes?: string;
          image_url?: string | null;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_name: string;
          badge_type: string;
          unlocked_at: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          target_quantity: number | null;
          target_reduction_percent: number | null;
          period: string;
          start_date: string;
          end_date: string;
          achieved: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_quantity?: number | null;
          target_reduction_percent?: number | null;
          period: string;
          start_date: string;
          end_date: string;
          achieved?: boolean;
        };
      };
    };
  };
};
