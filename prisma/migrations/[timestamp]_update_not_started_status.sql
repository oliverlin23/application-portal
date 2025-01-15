-- Update any NOT_STARTED status to IN_PROGRESS
UPDATE "Application"
SET status = 'IN_PROGRESS'
WHERE status = 'NOT_STARTED'; 