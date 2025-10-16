/*
  # Create Songs and Settings Tables

  ## Overview
  This migration creates the core database structure for the Capoeira Songs application,
  replacing localStorage with persistent Supabase storage.

  ## New Tables

  ### 1. `songs`
  Stores all capoeira songs with their details:
  - `id` (uuid, primary key) - Unique identifier for each song
  - `user_id` (uuid, foreign key) - Links to auth.users, owner of the song
  - `title` (text, not null) - Song title
  - `category` (text, not null) - One of: angola, saoBentoPequeno, saoBentoGrande
  - `mnemonic` (text, nullable) - Short mnemonic for the prompter
  - `lyrics` (text, nullable) - Full song lyrics
  - `media_link` (text, nullable) - Link to audio/video media
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ### 2. `prompter_settings`
  Stores user-specific prompter configuration:
  - `user_id` (uuid, primary key) - Links to auth.users, one row per user
  - `rotation_interval` (integer, default 120) - Seconds between song rotations
  - `font_size` (text, default 'medium') - Font size: small, medium, large, xlarge
  - `is_dark_mode` (boolean, default true) - Dark mode preference
  - `use_high_contrast` (boolean, default false) - High contrast mode
  - `upper_case` (boolean, default false) - Display text in uppercase
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  
  ### Row Level Security (RLS)
  Both tables have RLS enabled with policies ensuring:
  - Users can only access their own data
  - Authenticated users are required for all operations
  - Full CRUD operations are permitted on own data
  
  ### Policies Applied
  - Songs: Select, insert, update, delete own songs only
  - Settings: Select, insert, update own settings only (no delete needed)

  ## Indexes
  - `songs.user_id` - For efficient user-specific queries
  - `songs.category` - For efficient category filtering
  - Composite index on (user_id, category) for prompter queries

  ## Important Notes
  1. All existing localStorage data will need to be migrated client-side
  2. Users must be authenticated to use the application
  3. Settings are created on-demand with sensible defaults
  4. Song categories are constrained to valid values
*/

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('angola', 'saoBentoPequeno', 'saoBentoGrande')),
  mnemonic text,
  lyrics text,
  media_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prompter_settings table
CREATE TABLE IF NOT EXISTS prompter_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rotation_interval integer DEFAULT 120 NOT NULL,
  font_size text DEFAULT 'medium' NOT NULL CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  is_dark_mode boolean DEFAULT true NOT NULL,
  use_high_contrast boolean DEFAULT false NOT NULL,
  upper_case boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category);
CREATE INDEX IF NOT EXISTS idx_songs_user_category ON songs(user_id, category);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompter_settings ENABLE ROW LEVEL SECURITY;

-- Songs policies
CREATE POLICY "Users can view own songs"
  ON songs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own songs"
  ON songs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own songs"
  ON songs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own songs"
  ON songs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Prompter settings policies
CREATE POLICY "Users can view own settings"
  ON prompter_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON prompter_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON prompter_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at
CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompter_settings_updated_at
  BEFORE UPDATE ON prompter_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();