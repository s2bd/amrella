-- Create admin users (update with real user IDs after registration)
-- First, let's insert some platform settings
INSERT INTO platform_settings (key, value) VALUES
('platform_name', '"Amrella"'),
('email_verification_required', 'false'),
('max_file_size_mb', '50'),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"]'),
('maintenance_mode', 'false'),
('registration_enabled', 'true');

-- Insert sample support ticket categories and priorities
-- These will be used in the frontend dropdowns

-- Note: To make a user admin, you'll need to update their role after they register:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@mux8.com';
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'superadmin@mux8.com';

-- Sample verified users (update with real user IDs)
-- UPDATE profiles SET is_verified = true, verification_type = 'creator' WHERE email = 'creator@mux8.com';
