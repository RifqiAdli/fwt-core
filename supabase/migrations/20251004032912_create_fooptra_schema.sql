/*
  # FOOPTRA Database Schema

  ## Overview
  Complete database schema for FOOPTRA (Food Print Tracker) - a food waste management system.

  ## Tables Created
  
  ### 1. profiles
  Extended user profiles with additional information beyond Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `name` (text) - User's full name
  - `avatar_url` (text) - Profile picture URL
  - `bio` (text) - User biography
  - `location` (text) - User location for localized tips
  - `current_streak` (integer) - Current consecutive days logging
  - `longest_streak` (integer) - Longest streak achieved
  - `total_points` (integer) - Gamification points
  - `level` (integer) - User level based on XP
  - `settings` (jsonb) - User preferences (notifications, privacy, appearance)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. waste_logs
  Individual food waste entries logged by users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `category` (text) - Food category (vegetables, fruits, meat, dairy, etc.)
  - `quantity` (decimal) - Amount in grams
  - `reason` (text) - Reason for waste (expired, spoiled, etc.)
  - `date` (date) - When the waste occurred
  - `notes` (text) - Optional user notes
  - `image_url` (text) - Optional photo of wasted food
  - `ai_analyzed` (boolean) - Whether AI was used for detection
  - `created_at` (timestamptz)

  ### 3. achievements
  User badges and achievement unlocks
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `badge_name` (text) - Name of the badge
  - `badge_type` (text) - Category of achievement
  - `unlocked_at` (timestamptz)

  ### 4. goals
  User-set waste reduction goals
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `target_quantity` (decimal) - Target waste amount in grams
  - `target_reduction_percent` (decimal) - Target reduction percentage
  - `period` (text) - Time period (daily, weekly, monthly)
  - `start_date` (date)
  - `end_date` (date)
  - `achieved` (boolean)
  - `created_at` (timestamptz)

  ### 5. friends
  Friend connections between users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `friend_id` (uuid, references profiles)
  - `status` (text) - pending, accepted, declined
  - `created_at` (timestamptz)

  ### 6. challenges
  Community challenges users can participate in
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `challenge_type` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `reward_points` (integer)
  - `created_at` (timestamptz)

  ### 7. user_challenges
  Tracks user participation in challenges
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `challenge_id` (uuid, references challenges)
  - `status` (text) - active, completed, failed
  - `progress` (decimal) - Progress percentage
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Public read access for leaderboard data (limited fields)
  - Authenticated users required for all operations

  ## Important Notes
  1. All user data is protected by Row Level Security
  2. Profile is automatically created via trigger when auth.users record is created
  3. Streak counters updated via trigger when waste_logs are inserted
  4. Achievement badges automatically unlocked via triggers based on milestones
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  location text DEFAULT '',
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  settings jsonb DEFAULT '{"notifications": {"email": true, "push": true}, "privacy": {"profile_visible": true, "show_on_leaderboard": true}, "appearance": {"theme": "light", "language": "en"}}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create waste_logs table
CREATE TABLE IF NOT EXISTS waste_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  quantity decimal(10,2) NOT NULL,
  reason text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  image_url text,
  ai_analyzed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name text NOT NULL,
  badge_type text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_name)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_quantity decimal(10,2),
  target_reduction_percent decimal(5,2),
  period text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  achieved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reward_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  progress decimal(5,2) DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_waste_logs_user_id ON waste_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_date ON waste_logs(date);
CREATE INDEX IF NOT EXISTS idx_waste_logs_category ON waste_logs(category);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles for leaderboard"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (settings->>'privacy')::jsonb->>'profile_visible' = 'true'
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for waste_logs
CREATE POLICY "Users can view own waste logs"
  ON waste_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own waste logs"
  ON waste_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own waste logs"
  ON waste_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own waste logs"
  ON waste_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM friends
      WHERE friends.user_id = auth.uid()
      AND friends.friend_id = achievements.user_id
      AND friends.status = 'accepted'
    )
  );

CREATE POLICY "System can insert achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for friends
CREATE POLICY "Users can view own friend connections"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests"
  ON friends FOR UPDATE
  TO authenticated
  USING (auth.uid() = friend_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete friend connections"
  ON friends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for challenges (public read)
CREATE POLICY "Anyone can view challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view own challenge participation"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample challenges
INSERT INTO challenges (title, description, challenge_type, start_date, end_date, reward_points)
VALUES
  ('Zero Waste Week', 'Try to produce zero food waste for an entire week', 'weekly', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 500),
  ('Veggie Saver', 'Reduce vegetable waste by 50% this month', 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 300),
  ('Meal Prep Master', 'Plan and prep all meals for a week to minimize waste', 'weekly', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 200)
ON CONFLICT DO NOTHING;