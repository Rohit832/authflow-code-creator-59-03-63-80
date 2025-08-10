-- Remove the Salary Planning service by setting it to inactive
UPDATE individual_services 
SET is_active = false 
WHERE id = 'dd787b61-0285-45ae-9b36-e0502603e9d2' AND title = 'Salary Planning';