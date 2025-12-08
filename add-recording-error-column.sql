-- Add recording_error column to test_sessions table
-- Run this in your Supabase SQL Editor

ALTER TABLE test_sessions
ADD COLUMN IF NOT EXISTS recording_error TEXT;

COMMENT ON COLUMN test_sessions.recording_error IS 'JSON string containing recording error details if recording failed';
