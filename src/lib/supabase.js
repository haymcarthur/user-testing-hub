import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all test results for a given test, filtered by project status and test round
export async function fetchTestResults(testId = 'highlights', projectStatus = null, testRound = 'all') {
  try {
    // Fetch all sessions for this test
    let query = supabase
      .from('test_sessions')
      .select('*')
      .eq('test_id', testId)
      .not('completed_at', 'is', null); // Only completed sessions

    // Filter by project status if provided
    if (projectStatus) {
      query = query.eq('project_status', projectStatus);
    }

    // Filter by test round if not 'all'
    if (testRound && testRound !== 'all') {
      const roundNumber = parseInt(testRound);
      query = query.eq('test_round', roundNumber);
    }

    const { data: sessions, error: sessionsError } = await query
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    // If no sessions match the filters, return empty data
    if (!sessions || sessions.length === 0) {
      return {
        sessions: [],
        taskCompletions: [],
        surveyResponses: [],
        validationData: [],
      };
    }

    const sessionIds = sessions.map(s => s.id);

    // Fetch all task completions
    const { data: taskCompletions, error: taskError } = await supabase
      .from('task_completions')
      .select('*')
      .in('session_id', sessionIds);

    if (taskError) throw taskError;

    // Fetch all survey responses
    const { data: surveyResponses, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*')
      .in('session_id', sessionIds);

    if (surveyError) throw surveyError;

    // Fetch validation data
    const { data: validationData, error: validationError } = await supabase
      .from('task_validation_data')
      .select('*')
      .in('session_id', sessionIds);

    if (validationError) throw validationError;

    return {
      sessions,
      taskCompletions,
      surveyResponses,
      validationData,
    };
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
}

// Calculate statistics from raw data
export function calculateStatistics(data) {
  const { sessions, taskCompletions, surveyResponses } = data;

  // Total participants
  const totalParticipants = sessions.length;

  // Task statistics
  const taskStats = {};
  ['A', 'B', 'C'].forEach(taskId => {
    const taskData = taskCompletions.filter(tc => tc.task_id === taskId);

    if (taskData.length > 0) {
      const avgTime = taskData.reduce((sum, tc) => sum + (tc.time_spent_seconds || 0), 0) / taskData.length;
      const selfReportedSuccess = taskData.filter(tc => tc.self_reported_success).length;
      const actualSuccess = taskData.filter(tc => tc.actual_success).length;
      const avgDifficulty = taskData.reduce((sum, tc) => sum + tc.difficulty_rating, 0) / taskData.length;

      taskStats[taskId] = {
        avgTimeSeconds: Math.round(avgTime),
        selfReportedSuccessRate: Math.round((selfReportedSuccess / taskData.length) * 100),
        actualSuccessRate: Math.round((actualSuccess / taskData.length) * 100),
        avgDifficulty: avgDifficulty.toFixed(1),
        totalAttempts: taskData.length,
      };
    }
  });

  // Method preferences - only count preferences from filtered sessions
  const sessionIds = sessions.map(s => s.id);
  const filteredSurveyResponses = surveyResponses.filter(sr => sessionIds.includes(sr.session_id));

  console.log('[STATS] Total sessions:', sessions.length);
  console.log('[STATS] Session IDs:', sessionIds);
  console.log('[STATS] Survey responses received:', surveyResponses.length);
  console.log('[STATS] Filtered survey responses:', filteredSurveyResponses.length);
  console.log('[STATS] Survey response session IDs:', surveyResponses.map(sr => sr.session_id));

  // IMPORTANT: Deduplicate survey responses - only keep the most recent one per session
  // This handles cases where survey was accidentally submitted multiple times
  const surveyResponsesBySession = new Map();
  filteredSurveyResponses.forEach(sr => {
    if (!surveyResponsesBySession.has(sr.session_id) ||
        new Date(sr.created_at) > new Date(surveyResponsesBySession.get(sr.session_id).created_at)) {
      surveyResponsesBySession.set(sr.session_id, sr);
    }
  });
  const uniqueSurveyResponses = Array.from(surveyResponsesBySession.values());

  console.log('[STATS] Unique survey responses (after deduplication):', uniqueSurveyResponses.length);

  const preferences = {};
  uniqueSurveyResponses.forEach(sr => {
    preferences[sr.preferred_method] = (preferences[sr.preferred_method] || 0) + 1;
  });

  console.log('[STATS] Preference counts:', preferences);

  const preferenceStats = Object.entries(preferences).map(([method, count]) => ({
    method: method, // Keep as 'A', 'B', 'C' - UI will map to display names
    count,
    percentage: uniqueSurveyResponses.length > 0 ? Math.round((count / uniqueSurveyResponses.length) * 100) : 0,
  }));

  // Get preference reasons - only from unique survey responses
  const preferenceReasons = uniqueSurveyResponses.map(sr => ({
    method: sr.preferred_method,
    reason: sr.preference_reason,
  }));

  return {
    totalParticipants,
    taskStats,
    preferenceStats,
    preferenceReasons,
  };
}

// Delete a single session by ID
export async function deleteSession(sessionId) {
  try {
    console.log('deleteSession: Starting delete for session ID:', sessionId);

    // Delete data from all related tables
    console.log('deleteSession: Deleting validation data...');
    const { error: validationError } = await supabase
      .from('task_validation_data')
      .delete()
      .eq('session_id', sessionId);

    if (validationError) {
      console.error('deleteSession: Validation delete error:', validationError);
      throw validationError;
    }

    console.log('deleteSession: Deleting survey responses...');
    const { error: surveyError } = await supabase
      .from('survey_responses')
      .delete()
      .eq('session_id', sessionId);

    if (surveyError) {
      console.error('deleteSession: Survey delete error:', surveyError);
      throw surveyError;
    }

    console.log('deleteSession: Deleting task completions...');
    const { error: taskError } = await supabase
      .from('task_completions')
      .delete()
      .eq('session_id', sessionId);

    if (taskError) {
      console.error('deleteSession: Task delete error:', taskError);
      throw taskError;
    }

    console.log('deleteSession: Deleting test session...');
    const { error: sessionsDeleteError } = await supabase
      .from('test_sessions')
      .delete()
      .eq('id', sessionId);

    if (sessionsDeleteError) {
      console.error('deleteSession: Session delete error:', sessionsDeleteError);
      throw sessionsDeleteError;
    }

    console.log('deleteSession: All deletes completed successfully');
    return { success: true, message: 'Session deleted successfully' };
  } catch (error) {
    console.error('deleteSession: Error deleting session:', error);
    throw error;
  }
}

// Clear all test data for a given test ID
export async function clearTestData(testId) {
  try {
    // First, get all session IDs for this test
    const { data: sessions, error: sessionsError } = await supabase
      .from('test_sessions')
      .select('id')
      .eq('test_id', testId);

    if (sessionsError) throw sessionsError;

    const sessionIds = sessions.map(s => s.id);

    if (sessionIds.length === 0) {
      return { success: true, message: 'No data to clear' };
    }

    // Delete data from all related tables
    const { error: validationError } = await supabase
      .from('task_validation_data')
      .delete()
      .in('session_id', sessionIds);

    if (validationError) throw validationError;

    const { error: surveyError } = await supabase
      .from('survey_responses')
      .delete()
      .in('session_id', sessionIds);

    if (surveyError) throw surveyError;

    const { error: taskError } = await supabase
      .from('task_completions')
      .delete()
      .in('session_id', sessionIds);

    if (taskError) throw taskError;

    const { error: sessionsDeleteError } = await supabase
      .from('test_sessions')
      .delete()
      .eq('test_id', testId);

    if (sessionsDeleteError) throw sessionsDeleteError;

    return { success: true, message: `Cleared ${sessionIds.length} sessions` };
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
}
