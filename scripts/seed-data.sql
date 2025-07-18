-- Insert sample groups
INSERT INTO groups (name, description, category, privacy, owner_id) VALUES
('Web Developers Unite', 'A community for web developers to share knowledge and collaborate', 'Technology', 'public', (SELECT id FROM profiles LIMIT 1)),
('Digital Marketing Masters', 'Learn and share digital marketing strategies', 'Business', 'public', (SELECT id FROM profiles LIMIT 1)),
('Fitness Enthusiasts', 'Stay motivated and share your fitness journey', 'Health', 'public', (SELECT id FROM profiles LIMIT 1)),
('Creative Writers Circle', 'A space for writers to share their work and get feedback', 'Arts', 'public', (SELECT id FROM profiles LIMIT 1)),
('Startup Founders Network', 'Connect with fellow entrepreneurs and startup founders', 'Business', 'private', (SELECT id FROM profiles LIMIT 1));

-- Insert sample events
INSERT INTO events (title, description, start_date, end_date, location, category, organizer_id) VALUES
('Web Development Workshop', 'Learn modern web development techniques', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'Online', 'Technology', (SELECT id FROM profiles LIMIT 1)),
('Networking Mixer', 'Connect with professionals in your industry', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '2 hours', 'Downtown Conference Center', 'Business', (SELECT id FROM profiles LIMIT 1)),
('Morning Yoga Session', 'Start your day with mindful movement', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 'Central Park', 'Health', (SELECT id FROM profiles LIMIT 1));

-- Insert sample courses
INSERT INTO courses (title, description, category, level, duration_hours, instructor_id, is_published) VALUES
('Complete React Development', 'Master React from basics to advanced concepts', 'Technology', 'intermediate', 40, (SELECT id FROM profiles LIMIT 1), true),
('Digital Marketing Fundamentals', 'Learn the basics of digital marketing', 'Business', 'beginner', 20, (SELECT id FROM profiles LIMIT 1), true),
('Creative Writing Workshop', 'Develop your creative writing skills', 'Arts', 'beginner', 15, (SELECT id FROM profiles LIMIT 1), true);
