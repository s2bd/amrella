/*
  # Add group member count functions

  1. Functions
    - `increment_group_members` - Increment member count for a group
    - `decrement_group_members` - Decrement member count for a group

  2. Updates
    - Ensure group member counts are accurate
*/

-- Function to increment group member count
CREATE OR REPLACE FUNCTION increment_group_members(group_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE groups 
  SET member_count = member_count + 1 
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement group member count
CREATE OR REPLACE FUNCTION decrement_group_members(group_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE groups 
  SET member_count = GREATEST(member_count - 1, 0) 
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing group member counts to be accurate
UPDATE groups 
SET member_count = (
  SELECT COUNT(*) 
  FROM group_members 
  WHERE group_members.group_id = groups.id
);
