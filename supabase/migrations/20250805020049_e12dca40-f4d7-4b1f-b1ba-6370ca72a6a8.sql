-- Insert sample tools service plans
INSERT INTO public.service_plans (title, description, price, duration, plan_type, features) VALUES
(
  'Financial Tools Bundle',
  'Designed to save you time, stress, and guesswork.',
  1499,
  'Lifetime access',
  'tools',
  ARRAY[
    'Insurance buying checklist',
    'EMI planning calculator',
    'Monthly budget tracker',
    'Tax-saving checklist'
  ]
),
(
  'Premium Tools + Support',
  'All basic tools plus advanced features and support.',
  2999,
  'Lifetime access',
  'tools',
  ARRAY[
    'All basic tools',
    'Advanced calculators',
    'Investment portfolio tracker',
    'Financial goal planner',
    '30-day email support',
    'Monthly updates'
  ]
);