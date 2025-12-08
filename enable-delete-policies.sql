-- Enable DELETE operations for all test-related tables
-- These policies allow anyone with the anon key to delete data
-- Run this in your Supabase SQL Editor

-- Policy for test_sessions
DROP POLICY IF EXISTS "Enable delete for all users" ON test_sessions;
CREATE POLICY "Enable delete for all users" ON test_sessions
  FOR DELETE
  USING (true);

-- Policy for task_completions
DROP POLICY IF EXISTS "Enable delete for all users" ON task_completions;
CREATE POLICY "Enable delete for all users" ON task_completions
  FOR DELETE
  USING (true);

-- Policy for survey_responses
DROP POLICY IF EXISTS "Enable delete for all users" ON survey_responses;
CREATE POLICY "Enable delete for all users" ON survey_responses
  FOR DELETE
  USING (true);

-- Policy for task_validation_data
DROP POLICY IF EXISTS "Enable delete for all users" ON task_validation_data;
CREATE POLICY "Enable delete for all users" ON task_validation_data
  FOR DELETE
  USING (true);
