-- Insert 10 sample 1:1 sessions
INSERT INTO public.sessions (title, description, session_date, session_time, duration, location, session_type, status, max_participants) VALUES
('Personal Finance Consultation', 'One-on-one financial planning session to review your current financial situation and create a personalized budget.', '2024-08-05', '09:00:00', '60 mins', 'Online', '1:1', 'scheduled', NULL),
('Investment Strategy Planning', 'Deep dive into investment options tailored to your risk profile and financial goals.', '2024-08-06', '10:30:00', '90 mins', 'Office', '1:1', 'scheduled', NULL),
('Debt Management Review', 'Comprehensive review of existing debts and strategies for efficient debt reduction.', '2024-08-07', '14:00:00', '60 mins', 'Online', '1:1', 'scheduled', NULL),
('Retirement Planning Session', 'Long-term financial planning focused on retirement goals and pension optimization.', '2024-08-08', '11:00:00', '75 mins', 'Office', '1:1', 'scheduled', NULL),
('Tax Optimization Consultation', 'Review of tax strategies to minimize liability and maximize savings.', '2024-08-09', '15:30:00', '60 mins', 'Online', '1:1', 'scheduled', NULL),
('Emergency Fund Planning', 'Setting up and managing emergency funds for financial security.', '2024-08-12', '09:30:00', '45 mins', 'Online', '1:1', 'scheduled', NULL),
('Insurance Coverage Review', 'Comprehensive review of life, health, and property insurance needs.', '2024-08-13', '13:00:00', '60 mins', 'Office', '1:1', 'scheduled', NULL),
('Business Financial Planning', 'Financial planning specifically designed for entrepreneurs and small business owners.', '2024-08-14', '16:00:00', '90 mins', 'Office', '1:1', 'scheduled', NULL),
('Education Fund Planning', 'Planning and saving strategies for children''s education expenses.', '2024-08-15', '10:00:00', '60 mins', 'Online', '1:1', 'scheduled', NULL),
('Estate Planning Consultation', 'Will preparation, inheritance planning, and wealth transfer strategies.', '2024-08-16', '14:30:00', '75 mins', 'Office', '1:1', 'scheduled', NULL);

-- Insert 10 sample group sessions
INSERT INTO public.sessions (title, description, session_date, session_time, duration, location, session_type, status, max_participants) VALUES
('Financial Literacy Workshop', 'Interactive workshop covering basic financial concepts, budgeting, and money management skills.', '2024-08-05', '18:00:00', '120 mins', 'Conference Room A', 'group', 'scheduled', 12),
('Investment Fundamentals Seminar', 'Group seminar introducing various investment vehicles, risk assessment, and portfolio diversification.', '2024-08-07', '19:00:00', '90 mins', 'Online', 'group', 'scheduled', 15),
('Cryptocurrency & Digital Assets', 'Understanding cryptocurrency markets, blockchain technology, and digital investment strategies.', '2024-08-09', '18:30:00', '90 mins', 'Conference Room B', 'group', 'scheduled', 10),
('Home Buying Workshop', 'Complete guide to purchasing your first home, including mortgages, loans, and market analysis.', '2024-08-12', '17:00:00', '150 mins', 'Main Hall', 'group', 'scheduled', 20),
('Small Business Finance Bootcamp', 'Comprehensive session on business loans, cash flow management, and growth financing.', '2024-08-14', '18:00:00', '180 mins', 'Training Center', 'group', 'scheduled', 8),
('Women in Finance Empowerment', 'Special session focused on financial independence and investment strategies for women.', '2024-08-16', '16:00:00', '120 mins', 'Conference Room A', 'group', 'scheduled', 15),
('Retirement Planning for Millennials', 'Age-specific retirement planning strategies for the millennial generation.', '2024-08-19', '19:30:00', '90 mins', 'Online', 'group', 'scheduled', 25),
('Tax Season Preparation Workshop', 'Group session on tax planning, deductions, and preparation strategies.', '2024-08-21', '18:00:00', '105 mins', 'Conference Room B', 'group', 'scheduled', 12),
('Family Financial Planning', 'Collaborative session for couples and families on joint financial goals and budgeting.', '2024-08-23', '17:30:00', '120 mins', 'Main Hall', 'group', 'scheduled', 16),
('Advanced Trading Strategies', 'Deep dive into advanced trading techniques, market analysis, and risk management.', '2024-08-26', '19:00:00', '135 mins', 'Trading Lab', 'group', 'scheduled', 6);