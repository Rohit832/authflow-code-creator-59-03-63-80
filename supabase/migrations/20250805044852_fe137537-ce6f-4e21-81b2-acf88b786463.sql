-- Cancel any bookings related to the Salary Planning service
UPDATE individual_bookings 
SET status = 'cancelled', cancelled_at = now()
WHERE service_id = 'dd787b61-0285-45ae-9b36-e0502603e9d2' AND status != 'cancelled';