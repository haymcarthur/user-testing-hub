import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function backupTestData(testId = 'highlights') {
  try {
    console.log(`Backing up data for test: ${testId}...`);

    // Fetch all sessions for this test
    const { data: sessions, error: sessionsError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('test_id', testId);

    if (sessionsError) throw sessionsError;
    console.log(`Found ${sessions.length} test sessions`);

    const sessionIds = sessions.map(s => s.id);

    // Fetch all task completions
    const { data: taskCompletions, error: taskError } = await supabase
      .from('task_completions')
      .select('*')
      .in('session_id', sessionIds);

    if (taskError) throw taskError;
    console.log(`Found ${taskCompletions?.length || 0} task completions`);

    // Fetch all survey responses
    const { data: surveyResponses, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*')
      .in('session_id', sessionIds);

    if (surveyError) throw surveyError;
    console.log(`Found ${surveyResponses?.length || 0} survey responses`);

    // Fetch validation data
    const { data: validationData, error: validationError } = await supabase
      .from('task_validation_data')
      .select('*')
      .in('session_id', sessionIds);

    if (validationError) throw validationError;
    console.log(`Found ${validationData?.length || 0} validation records`);

    const backup = {
      testId,
      backupDate: new Date().toISOString(),
      data: {
        sessions,
        taskCompletions,
        surveyResponses,
        validationData,
      },
    };

    const filename = `backup-${testId}-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2));

    console.log(`\n✅ Backup complete! Saved to: ${filename}`);
    console.log(`\nSummary:`);
    console.log(`- Test Sessions: ${sessions.length}`);
    console.log(`- Task Completions: ${taskCompletions?.length || 0}`);
    console.log(`- Survey Responses: ${surveyResponses?.length || 0}`);
    console.log(`- Validation Data: ${validationData?.length || 0}`);
  } catch (error) {
    console.error('Error backing up data:', error);
    throw error;
  }
}

backupTestData();
