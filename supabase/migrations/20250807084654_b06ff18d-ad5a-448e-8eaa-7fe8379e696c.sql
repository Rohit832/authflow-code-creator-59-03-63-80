-- Add 10 sample 1-on-1 sessions
INSERT INTO one_on_one_sessions (title, description, category, price_inr, duration, access_type, is_active) VALUES
('Personal Financial Planning', 'One-on-one session to create a comprehensive financial plan tailored to your goals', 'Financial Planning', 2500, '60 minutes', 'premium', true),
('Investment Strategy Consultation', 'Expert guidance on building your investment portfolio', 'Investment', 3000, '90 minutes', 'premium', true),
('Debt Management & Elimination', 'Personalized strategies to pay off debt and improve financial health', 'Debt Management', 2000, '45 minutes', 'premium', true),
('Tax Planning Session', 'Optimize your tax savings with professional tax planning advice', 'Tax Planning', 2800, '60 minutes', 'premium', true),
('Retirement Planning Consultation', 'Plan your retirement with expert guidance on savings and investments', 'Retirement', 3500, '75 minutes', 'premium', true),
('Emergency Fund Building', 'Learn how to build and maintain an emergency fund', 'Savings', 1800, '45 minutes', 'premium', true),
('Real Estate Investment Advice', 'Get expert advice on real estate investment opportunities', 'Real Estate', 4000, '90 minutes', 'exclusive', true),
('Business Financial Planning', 'Financial planning specifically for business owners and entrepreneurs', 'Business', 5000, '120 minutes', 'exclusive', true),
('Insurance Planning Session', 'Comprehensive review of your insurance needs and coverage', 'Insurance', 2200, '60 minutes', 'premium', true),
('Credit Score Improvement', 'Strategies to improve your credit score and financial profile', 'Credit', 1500, '45 minutes', 'premium', true);

-- Add 10 sample short programs
INSERT INTO short_programs (title, description, category, price_inr, duration, access_type, is_active) VALUES
('Financial Literacy Bootcamp', 'Complete 7-day program covering financial basics', 'Education', 5000, '7 days', 'premium', true),
('Investment Fundamentals Course', '14-day comprehensive course on investment principles', 'Investment', 8000, '14 days', 'premium', true),
('Budgeting Mastery Program', '10-day intensive program to master budgeting skills', 'Budgeting', 4500, '10 days', 'premium', true),
('Stock Market Analysis Workshop', '5-day workshop on technical and fundamental analysis', 'Stock Market', 6000, '5 days', 'premium', true),
('Cryptocurrency Investment Guide', '7-day program covering crypto investment strategies', 'Cryptocurrency', 7000, '7 days', 'premium', true),
('Mutual Fund Selection Program', '5-day course on selecting the right mutual funds', 'Mutual Funds', 4000, '5 days', 'premium', true),
('Tax Saving Strategies Course', '3-day intensive course on tax optimization', 'Tax', 3500, '3 days', 'premium', true),
('Personal Finance for Women', 'Specialized 10-day program addressing financial needs of women', 'Personal Finance', 5500, '10 days', 'premium', true),
('Freelancer Financial Management', '7-day program for freelancers and gig workers', 'Freelancing', 4800, '7 days', 'premium', true),
('Family Financial Planning', '14-day comprehensive program for family financial management', 'Family Finance', 6500, '14 days', 'premium', true);

-- Add 10 sample financial tools
INSERT INTO financial_tools (title, description, category, price_inr, duration, access_type, is_active) VALUES
('EMI Calculator Pro', 'Advanced EMI calculator with multiple loan scenarios', 'Calculators', 500, 'Lifetime', 'free', true),
('Investment Portfolio Tracker', 'Track your investments across multiple asset classes', 'Portfolio Management', 1200, '1 year', 'premium', true),
('Budget Planner & Tracker', 'Comprehensive budgeting tool with expense tracking', 'Budgeting', 800, '1 year', 'premium', true),
('Tax Calculator Suite', 'Complete tax calculation tools for different scenarios', 'Tax Tools', 1000, '1 year', 'premium', true),
('Retirement Planning Calculator', 'Advanced calculator to plan your retirement corpus', 'Retirement', 1500, 'Lifetime', 'premium', true),
('SIP Return Calculator', 'Calculate returns from systematic investment plans', 'SIP Tools', 600, '1 year', 'premium', true),
('Goal-based Investment Planner', 'Plan investments for specific financial goals', 'Goal Planning', 1800, '1 year', 'premium', true),
('Risk Assessment Tool', 'Assess your investment risk tolerance', 'Risk Management', 700, '6 months', 'premium', true),
('Insurance Need Calculator', 'Calculate your life and health insurance requirements', 'Insurance', 900, '1 year', 'premium', true),
('Expense Categorization Tool', 'AI-powered tool to categorize and analyze expenses', 'Expense Management', 2000, '1 year', 'exclusive', true);