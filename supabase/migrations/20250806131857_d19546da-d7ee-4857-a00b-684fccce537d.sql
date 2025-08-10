-- Create some test sessions for users to book
INSERT INTO sessions (
  title, 
  description, 
  session_type, 
  session_date, 
  session_time, 
  duration, 
  credits_required, 
  max_participants, 
  location, 
  status
) VALUES 
  (
    '1:1 Financial Planning Session',
    'Personal consultation on financial planning, budgeting, and investment strategies',
    '1:1',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    '60 mins',
    15,
    1,
    'Online (Google Meet)',
    'scheduled'
  ),
  (
    '1:1 Tax Planning Consultation',
    'One-on-one session focused on tax optimization and planning strategies',
    '1:1',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00:00',
    '60 mins',
    15,
    1,
    'Online (Google Meet)',
    'scheduled'
  ),
  (
    'Group Investment Workshop',
    'Learn the basics of investing in a group setting with other beginners',
    'group',
    CURRENT_DATE + INTERVAL '7 days',
    '16:00:00',
    '90 mins',
    5,
    8,
    'Online (Zoom)',
    'scheduled'
  ),
  (
    'Group Personal Finance Bootcamp',
    'Comprehensive group session covering budgeting, saving, and financial goals',
    'group',
    CURRENT_DATE + INTERVAL '10 days',
    '18:00:00',
    '90 mins',
    5,
    10,
    'Online (Zoom)',
    'scheduled'
  ),
  (
    'Financial Literacy Course - Module 1',
    'First module of our comprehensive financial literacy course',
    'course',
    CURRENT_DATE + INTERVAL '14 days',
    '19:00:00',
    '3 hours',
    10,
    20,
    'Online (Virtual Classroom)',
    'scheduled'
  );