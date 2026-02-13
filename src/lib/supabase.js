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

  // Dynamically determine task IDs from task completions (handles both 'A/B/C' and 'Prompt/Highlight')
  const uniqueTaskIds = [...new Set(taskCompletions.map(tc => tc.task_id))];
  console.log('[STATS] Unique task IDs found:', uniqueTaskIds);

  // Task statistics
  const taskStats = {};
  uniqueTaskIds.forEach(taskId => {
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

  // Method preferences - survey_responses table uses preferred_method column directly
  const sessionIds = sessions.map(s => s.id);
  const preferenceResponses = surveyResponses.filter(sr =>
    sessionIds.includes(sr.session_id) && sr.preferred_method
  );

  console.log('[STATS] Total sessions:', sessions.length);
  console.log('[STATS] Session IDs:', sessionIds);
  console.log('[STATS] Survey responses received:', surveyResponses.length);
  console.log('[STATS] Preference responses:', preferenceResponses.length);

  // Deduplicate preference responses - only keep the most recent one per session
  const preferencesBySession = new Map();
  preferenceResponses.forEach(sr => {
    if (!preferencesBySession.has(sr.session_id) ||
        new Date(sr.created_at) > new Date(preferencesBySession.get(sr.session_id).created_at)) {
      preferencesBySession.set(sr.session_id, sr);
    }
  });
  const uniquePreferences = Array.from(preferencesBySession.values());

  console.log('[STATS] Unique preferences (after deduplication):', uniquePreferences.length);

  // Count preferences - read from preferred_method column
  const preferences = {};
  uniquePreferences.forEach(sr => {
    const method = sr.preferred_method; // Database column: preferred_method
    preferences[method] = (preferences[method] || 0) + 1;
  });

  console.log('[STATS] Preference counts:', preferences);

  const preferenceStats = Object.entries(preferences).map(([method, count]) => ({
    method: method,
    count,
    percentage: uniquePreferences.length > 0 ? Math.round((count / uniquePreferences.length) * 100) : 0,
  }));

  // Get overall feedback - stored in preference_reason column
  const uniqueFeedback = uniquePreferences.filter(sr => sr.preference_reason);

  // Preference reasons - map preferred_method to preference_reason
  const preferenceReasons = uniquePreferences.map(sr => ({
    method: sr.preferred_method,
    reason: sr.preference_reason || '',
  })).filter(pr => pr.reason); // Only include if reason exists

  return {
    totalParticipants,
    taskStats,
    preferenceStats,
    preferenceReasons: preferenceReasons,
    overallFeedback: uniqueFeedback.map(sr => ({
      sessionId: sr.session_id,
      feedback: sr.preference_reason
    }))
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

// ============================================
// OBSERVATIONS
// ============================================

// Fetch all observations for a test
export async function fetchObservations(testId = 'highlights') {
  try {
    const { data, error } = await supabase
      .from('observations')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching observations:', error);
    throw error;
  }
}

// Save a new observation
export async function saveObservation(testId = 'highlights', observationData) {
  try {
    const { data, error } = await supabase
      .from('observations')
      .insert({
        test_id: testId,
        text: observationData.text,
        participant_ids: observationData.participantIds || [],
        created_at: observationData.createdAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving observation:', error);
    throw error;
  }
}

// Update an existing observation
export async function updateObservation(observationId, updates) {
  try {
    const updateData = {};
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.participantIds !== undefined) updateData.participant_ids = updates.participantIds;

    const { data, error } = await supabase
      .from('observations')
      .update(updateData)
      .eq('id', observationId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating observation:', error);
    throw error;
  }
}

// Delete an observation
export async function deleteObservation(observationId) {
  try {
    const { error } = await supabase
      .from('observations')
      .delete()
      .eq('id', observationId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting observation:', error);
    throw error;
  }
}
