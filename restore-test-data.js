import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function restoreTestData(backupFile) {
  try {
    console.log(`Reading backup file: ${backupFile}...`);

    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const backupContent = fs.readFileSync(backupFile, 'utf8');
    const backup = JSON.parse(backupContent);

    console.log(`\nBackup Info:`);
    console.log(`- Test ID: ${backup.testId}`);
    console.log(`- Backup Date: ${backup.backupDate}`);
    console.log(`- Sessions: ${backup.data.sessions.length}`);
    console.log(`- Task Completions: ${backup.data.taskCompletions?.length || 0}`);
    console.log(`- Survey Responses: ${backup.data.surveyResponses?.length || 0}`);
    console.log(`- Validation Data: ${backup.data.validationData?.length || 0}`);

    console.log(`\nRestoring data...`);

    // Restore sessions
    if (backup.data.sessions.length > 0) {
      const { error: sessionsError } = await supabase
        .from('test_sessions')
        .upsert(backup.data.sessions, { onConflict: 'id' });

      if (sessionsError) throw sessionsError;
      console.log(`✓ Restored ${backup.data.sessions.length} test sessions`);
    }

    // Restore task completions
    if (backup.data.taskCompletions?.length > 0) {
      const { error: taskError } = await supabase
        .from('task_completions')
        .upsert(backup.data.taskCompletions, { onConflict: 'id' });

      if (taskError) throw taskError;
      console.log(`✓ Restored ${backup.data.taskCompletions.length} task completions`);
    }

    // Restore survey responses
    if (backup.data.surveyResponses?.length > 0) {
      const { error: surveyError } = await supabase
        .from('survey_responses')
        .upsert(backup.data.surveyResponses, { onConflict: 'id' });

      if (surveyError) throw surveyError;
      console.log(`✓ Restored ${backup.data.surveyResponses.length} survey responses`);
    }

    // Restore validation data
    if (backup.data.validationData?.length > 0) {
      const { error: validationError } = await supabase
        .from('task_validation_data')
        .upsert(backup.data.validationData, { onConflict: 'id' });

      if (validationError) throw validationError;
      console.log(`✓ Restored ${backup.data.validationData.length} validation records`);
    }

    console.log(`\n✅ Restore complete!`);
  } catch (error) {
    console.error('Error restoring data:', error);
    throw error;
  }
}

// Get backup file from command line argument or use default
const backupFile = process.argv[2] || 'backup-highlights-2025-11-20.json';
restoreTestData(backupFile);
