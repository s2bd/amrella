/*
  # Add comment count functions

  1. Functions
    - `increment_post_comments` - Increment comment count for a post
    - `decrement_post_comments` - Decrement comment count for a post
    - `update_comment_counts` - Trigger function to maintain comment counts

  2. Triggers
    - Automatically update comment counts when comments are added/removed
*/

-- Function to increment post comment count
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement post comment count
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts 
  SET comments_count = GREATEST(comments_count - 1, 0) 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment counts automatically
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_post_comments(NEW.post_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_post_comments(OLD.post_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic comment count updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'comment_count_trigger'
  ) THEN
    CREATE TRIGGER comment_count_trigger
      AFTER INSERT OR DELETE ON comments
      FOR EACH ROW EXECUTE FUNCTION update_comment_counts();
  END IF;
END $$;