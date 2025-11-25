-- Add project_status column to test_sessions table (default to 'planning' for future sessions)
ALTER TABLE test_sessions
ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'planning';

-- Set existing sessions to 'in progress' status (because they're from live user testing)
UPDATE test_sessions
SET project_status = 'in progress'
WHERE project_status IS NULL;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_test_sessions_project_status
ON test_sessions(test_id, project_status);

-- Verify the changes
SELECT
  project_status,
  COUNT(*) as session_count
FROM test_sessions
WHERE test_id = 'highlights'
GROUP BY project_status;

-- NOTE: After running this migration, you should also:
-- 1. The "highlights" project in the code is already set to "in progress" status
-- 2. When you first view the highlights project after this migration,
--    it will save "in progress" to localStorage and show all your existing results
-- 3. Any NEW test projects you add will default to "planning" status
