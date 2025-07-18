-- Add email column to profiles if not exists and ensure it's populated
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add media storage columns for blob data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image BYTEA;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_data BYTEA;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_filename TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS cover_image BYTEA;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image BYTEA;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_data BYTEA;

-- Create forums table
CREATE TABLE IF NOT EXISTS forums (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_data BYTEA,
  video_filename TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- Create follows table for user connections
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_forums_group_id ON forums(group_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_forum_id ON forum_topics(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Enable RLS
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Forums are viewable by everyone" ON forums FOR SELECT USING (true);
CREATE POLICY "Users can create forums" ON forums FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Forum topics are viewable by everyone" ON forum_topics FOR SELECT USING (true);
CREATE POLICY "Users can create topics" ON forum_topics FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Forum replies are viewable by everyone" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Course lessons are viewable by enrolled users" ON course_lessons
  FOR SELECT USING (
    course_id IN (
      SELECT course_id FROM course_enrollments WHERE user_id = auth.uid()
    ) OR 
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own lesson progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Function to update email in profiles when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing profiles with email if missing
UPDATE profiles SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id AND profiles.email IS NULL;
