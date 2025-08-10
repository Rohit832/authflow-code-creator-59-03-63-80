-- Remove the service plans with salary planning titles
DELETE FROM service_plans 
WHERE title = 'Planning your salary better' OR title = 'Salary → SIP made simple';