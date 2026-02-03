import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  fetchTestResults,
  calculateStatistics,
  deleteSession,
  fetchObservations,
  saveObservation,
  updateObservation,
  deleteObservation
} from '../lib/supabase';

// Task name mapping (Round 2: Red/Blue/Green Method)
const TASK_NAMES = {
  'A': 'Red Method',
  'B': 'Blue Method',
  'C': 'Green Method'
};

const testData = {
  highlights: {
    title: 'Birth Record Highlights',
    description: 'A/B testing different methods of highlighting information on historical birth records',
    objective: 'Compare three different highlighting methods to determine which provides the best user experience for extracting information from historical documents.',
    tasks: [
      'Red Method (Task A): Manual highlight with attach/detach buttons',
      'Blue Method (Task B): Field-focused highlighting with automatic attachment',
      'Green Method (Task C): Simple highlight mode for general information',
    ],
    created: 'November 2025',
    status: 'planning',
    participants: 0,
    url: 'https://highlight-user-test.vercel.app/',
  },
  'index-creation': {
    title: 'Index Creation Study',
    description: 'Testing the interface for adding people to household groups in census records',
    objective: 'Evaluate the usability of the interface for adding Gary Fadden and Ronald Fadden to Edgar Fadden\'s household in the 1950 census.',
    tasks: [
      'Add Gary Fadden and Ronald Fadden to Edgar Fadden\'s household',
    ],
    created: 'December 2025',
    status: 'in progress',
    participants: 0,
    url: 'https://index-creation-haylee-mcarthurs-projects.vercel.app/',
  },
  'ai-auto-index': {
    title: 'AI Auto Index Study',
    description: 'A/B test comparing AI-assisted vs manual form filling for index card creation',
    objective: 'Evaluate the efficiency and accuracy of AI-powered auto-indexing compared to traditional manual data entry',
    tasks: [
      'Complete the index card form using assigned method (AI-assisted or manual)',
      'Review and validate the auto-filled information',
      'Submit completed index card',
    ],
    created: 'February 2026',
    status: 'planning',
    participants: 0,
    url: 'https://ai-auto-indexing.vercel.app/',
  },
};

const TestDetail = () => {
  const { testId } = useParams();
  const test = testData[testId];
  const [stats, setStats] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoveredParticipant, setHoveredParticipant] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('planning');
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [finalDecisions, setFinalDecisions] = useState('');
  const [showDecisionsModal, setShowDecisionsModal] = useState(false);
  const [observations, setObservations] = useState([]);
  const [newObservation, setNewObservation] = useState('');
  const [editingObservation, setEditingObservation] = useState(null);
  const [testRoundFilter, setTestRoundFilter] = useState('all'); // 'all', '1', or '2'
  const [videoModalSession, setVideoModalSession] = useState(null); // Changed from videoModalUrl to store full session
  const [selectedObservationText, setSelectedObservationText] = useState('');
  const [showObservationDropdown, setShowObservationDropdown] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef(null);

  // ESC key to close video modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && videoModalSession) {
        setVideoModalSession(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [videoModalSession]);

  // Apply playback speed to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Reset playback speed when video modal opens
  useEffect(() => {
    if (videoModalSession) {
      setPlaybackSpeed(1);
    }
  }, [videoModalSession]);

  // Load status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('projectStatuses');
    if (saved) {
      try {
        const statuses = JSON.parse(saved);
        if (statuses[testId]) {
          setCurrentStatus(statuses[testId]);
        } else {
          // Use the test's default status from testData and save it
          const defaultStatus = test?.status || 'planning';
          setCurrentStatus(defaultStatus);
          statuses[testId] = defaultStatus;
          localStorage.setItem('projectStatuses', JSON.stringify(statuses));
        }
      } catch (err) {
        console.error('Error loading status:', err);
      }
    } else {
      // Use the test's default status from testData and save it
      const defaultStatus = test?.status || 'planning';
      setCurrentStatus(defaultStatus);
      const statuses = { [testId]: defaultStatus };
      localStorage.setItem('projectStatuses', JSON.stringify(statuses));
    }
    setStatusLoaded(true);
  }, [testId, test]);

  // Load final decisions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('projectFinalDecisions');
    if (saved) {
      try {
        const decisions = JSON.parse(saved);
        if (decisions[testId]) {
          setFinalDecisions(decisions[testId]);
        }
      } catch (err) {
        console.error('Error loading final decisions:', err);
      }
    }
  }, [testId]);

  // Load observations from database (with localStorage migration)
  useEffect(() => {
    async function loadObservations() {
      try {
        // First, try to load from database
        const dbObservations = await fetchObservations(testId);

        // Map database format to component format
        const mappedObservations = dbObservations.map(obs => ({
          id: obs.id,
          text: obs.text,
          participantIds: obs.participant_ids || [],
          createdAt: obs.created_at,
        }));

        setObservations(mappedObservations);

        // One-time migration: check if there are observations in localStorage that aren't in database
        const localStorageKey = 'projectObservations';
        const saved = localStorage.getItem(localStorageKey);
        if (saved) {
          try {
            const allLocalObservations = JSON.parse(saved);
            const localObservations = allLocalObservations[testId] || [];

            // Check if there are any localStorage observations not in database
            const dbTexts = new Set(mappedObservations.map(obs => obs.text));
            const newObservations = localObservations.filter(obs => !dbTexts.has(obs.text));

            if (newObservations.length > 0) {
              console.log(`Migrating ${newObservations.length} observations from localStorage to database...`);

              // Save each new observation to database
              for (const obs of newObservations) {
                await saveObservation(testId, {
                  text: obs.text,
                  participantIds: obs.participantIds || [],
                  createdAt: obs.createdAt || new Date().toISOString(),
                });
              }

              console.log('Migration complete!');

              // Reload observations from database
              const updatedDbObservations = await fetchObservations(testId);
              const updatedMappedObservations = updatedDbObservations.map(obs => ({
                id: obs.id,
                text: obs.text,
                participantIds: obs.participant_ids || [],
                createdAt: obs.created_at,
              }));
              setObservations(updatedMappedObservations);
            }

            // Clear localStorage after successful migration (keep it for other tests though)
            delete allLocalObservations[testId];
            localStorage.setItem(localStorageKey, JSON.stringify(allLocalObservations));
          } catch (err) {
            console.error('Error during localStorage migration:', err);
          }
        }
      } catch (err) {
        console.error('Error loading observations:', err);
      }
    }

    if (testId) {
      loadObservations();
    }
  }, [testId]);

  // No longer needed - observations are now stored in database

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        // When status is "complete", show results from "in progress" phase
        // This allows team members to try the test without their results being shown
        const statusFilter = currentStatus === 'complete' ? 'in progress' : currentStatus;
        console.log('Loading results with filters:', { testId, statusFilter, testRoundFilter, currentStatus });
        const data = await fetchTestResults(testId, statusFilter, testRoundFilter);
        console.log('Loaded sessions:', data.sessions?.length, 'sessions');
        console.log('Session details:', data.sessions?.map(s => ({ id: s.id, status: s.project_status, round: s.test_round, test_id: s.test_id })));
        const statistics = calculateStatistics(data);
        setStats(statistics);
        setRawData(data);
      } catch (err) {
        console.error('Error loading results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (testId && statusLoaded) {
      loadResults();
    }
  }, [testId, currentStatus, testRoundFilter, statusLoaded]);

  const handleExportResults = () => {
    if (!stats || !rawData) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    let csv = 'Birth Record Highlights User Test Results\n\n';

    // Summary statistics
    csv += 'SUMMARY\n';
    csv += `Total Participants,${stats.totalParticipants}\n`;
    csv += `Completion Rate,100%\n\n`;

    // Task performance
    csv += 'TASK PERFORMANCE\n';
    csv += 'Task,Avg Time (seconds),Avg Difficulty (1-5),Self-Reported Success %,Actual Success %,Total Attempts\n';
    ['A', 'B', 'C'].forEach(taskId => {
      const taskStat = stats.taskStats[taskId];
      if (taskStat) {
        csv += `${TASK_NAMES[taskId]},${taskStat.avgTimeSeconds},${taskStat.avgDifficulty},${taskStat.selfReportedSuccessRate},${taskStat.actualSuccessRate},${taskStat.totalAttempts}\n`;
      }
    });

    csv += '\n';

    // Method preferences
    csv += 'METHOD PREFERENCES\n';
    csv += 'Method,Count,Percentage\n';
    stats.preferenceStats.forEach(pref => {
      csv += `${pref.method},${pref.count},${pref.percentage}%\n`;
    });

    csv += '\n';

    // Preference reasons
    csv += 'USER FEEDBACK\n';
    csv += 'Preferred Method,Reason\n';
    stats.preferenceReasons.forEach(item => {
      const reason = item.reason.replace(/"/g, '""'); // Escape quotes
      csv += `Task ${item.method},"${reason}"\n`;
    });

    // Download the file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highlights-test-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewRawData = () => {
    setShowRawData(true);
  };

  const handleStatusChange = (newStatus) => {
    // Special handling for moving to Complete
    if (newStatus === 'complete') {
      // Show decisions modal instead of confirmation
      setShowDecisionsModal(true);
      return;
    }

    // Confirm status change
    let message = '';
    if (newStatus === 'planning') {
      message = 'Change project status to "Planning"? This will show only results collected during the planning phase. Use this phase to test your prototype and verify data collection. New test sessions will be recorded and displayed.';
    } else if (newStatus === 'in progress') {
      message = 'Change project status to "In Progress"? This will show only results collected during this phase (planning results will be hidden). New test sessions will be recorded and displayed. This is your main data collection phase with real testers.';
    }

    setConfirmModal({
      testId,
      newStatus,
      currentStatus,
      message,
      type: 'single-confirm',
    });
  };

  const showChangeStatusOptions = () => {
    setConfirmModal({
      testId,
      currentStatus,
      message: 'Where would you like to move this project?',
      type: 'change-status-options',
    });
  };

  const confirmStatusChange = async (newStatus = null) => {
    if (!confirmModal && !newStatus) return;

    const targetStatus = newStatus || confirmModal.newStatus;

    try {
      // Update status in localStorage
      const saved = localStorage.getItem('projectStatuses');
      const statuses = saved ? JSON.parse(saved) : {};
      statuses[testId] = targetStatus;
      localStorage.setItem('projectStatuses', JSON.stringify(statuses));

      // Update local state (this will trigger useEffect to reload results with new filter)
      setCurrentStatus(targetStatus);

      setConfirmModal(null);
    } catch (err) {
      console.error('Error changing status:', err);
      alert('Failed to change status: ' + err.message);
    }
  };

  const handleSaveFinalDecisions = () => {
    if (!finalDecisions.trim()) {
      alert('Please enter your final decisions before saving.');
      return;
    }

    try {
      // Save final decisions to localStorage
      const saved = localStorage.getItem('projectFinalDecisions');
      const decisions = saved ? JSON.parse(saved) : {};
      decisions[testId] = finalDecisions;
      localStorage.setItem('projectFinalDecisions', JSON.stringify(decisions));

      // Update status to complete
      confirmStatusChange('complete');

      // Close modal
      setShowDecisionsModal(false);
    } catch (err) {
      console.error('Error saving final decisions:', err);
      alert('Failed to save final decisions: ' + err.message);
    }
  };

  // Reload observations from database
  const reloadObservations = async () => {
    try {
      const dbObservations = await fetchObservations(testId);
      const mappedObservations = dbObservations.map(obs => ({
        id: obs.id,
        text: obs.text,
        participantIds: obs.participant_ids || [],
        createdAt: obs.created_at,
      }));
      setObservations(mappedObservations);
    } catch (err) {
      console.error('Error reloading observations:', err);
      alert('Failed to reload observations: ' + err.message);
    }
  };

  const handleAddObservation = async () => {
    if (!newObservation.trim()) return;

    try {
      await saveObservation(testId, {
        text: newObservation.trim(),
        participantIds: [], // Start with no linked participants
        createdAt: new Date().toISOString(),
      });

      setNewObservation('');
      await reloadObservations();
    } catch (err) {
      console.error('Error adding observation:', err);
      alert('Failed to add observation: ' + err.message);
    }
  };

  // Link observation to participant (create if doesn't exist)
  const linkObservationToParticipant = async (sessionId, observationText) => {
    if (!observationText.trim()) return;

    try {
      const existingObs = observations.find(obs => obs.text.toLowerCase() === observationText.trim().toLowerCase());

      if (existingObs) {
        // Add participant to existing observation
        if (!existingObs.participantIds.includes(sessionId)) {
          await updateObservation(existingObs.id, {
            participantIds: [...existingObs.participantIds, sessionId]
          });
        }
      } else {
        // Create new observation
        await saveObservation(testId, {
          text: observationText.trim(),
          participantIds: [sessionId],
          createdAt: new Date().toISOString(),
        });
      }

      setSelectedObservationText(''); // Clear input
      await reloadObservations();
    } catch (err) {
      console.error('Error linking observation to participant:', err);
      alert('Failed to link observation: ' + err.message);
    }
  };

  // Unlink observation from participant
  const unlinkObservationFromParticipant = async (sessionId, observationId) => {
    try {
      const obs = observations.find(o => o.id === observationId);
      if (!obs) return;

      const updatedParticipantIds = obs.participantIds.filter(id => id !== sessionId);

      await updateObservation(observationId, {
        participantIds: updatedParticipantIds
      });

      await reloadObservations();
    } catch (err) {
      console.error('Error unlinking observation from participant:', err);
      alert('Failed to unlink observation: ' + err.message);
    }
  };

  // Open video modal with participant context
  const openVideoModalWithParticipant = (session) => {
    setVideoModalSession(session);
    setSelectedObservationText(''); // Clear observation input when opening
  };

  const handleEditObservation = async (id, newText) => {
    if (!newText.trim()) return;

    try {
      await updateObservation(id, {
        text: newText.trim()
      });

      setEditingObservation(null);
      await reloadObservations();
    } catch (err) {
      console.error('Error editing observation:', err);
      alert('Failed to edit observation: ' + err.message);
    }
  };

  const handleDeleteObservation = async (id) => {
    if (!confirm('Are you sure you want to delete this observation?')) return;

    try {
      await deleteObservation(id);
      await reloadObservations();
    } catch (err) {
      console.error('Error deleting observation:', err);
      alert('Failed to delete observation: ' + err.message);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this participant\'s data? This cannot be undone.')) return;

    console.log('Starting delete for session:', sessionId);
    try {
      console.log('Calling deleteSession...');
      const result = await deleteSession(sessionId);
      console.log('Delete result:', result);

      // Unlink this participant from observations (but keep the observations)
      for (const obs of observations) {
        if (obs.participantIds.includes(sessionId)) {
          const updatedParticipantIds = obs.participantIds.filter(id => id !== sessionId);
          await updateObservation(obs.id, {
            participantIds: updatedParticipantIds
          });
        }
      }

      // Reload observations from database
      await reloadObservations();

      // Small delay to ensure Supabase replication completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload results
      const statusFilter = currentStatus === 'complete' ? 'in progress' : currentStatus;
      console.log('Reloading results with status:', statusFilter);
      const data = await fetchTestResults(testId, statusFilter, testRoundFilter);
      const statistics = calculateStatistics(data);
      setStats(statistics);
      setRawData(data);

      console.log('Delete completed successfully');
      alert('Participant deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session: ' + error.message);
    }
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Not Found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{test.description}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documentation Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Objective</h3>
                  <p className="text-gray-600">{test.objective}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full capitalize ${
                    currentStatus === 'planning' ? 'bg-gray-100 text-gray-800' :
                    currentStatus === 'in progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {currentStatus}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Created</h3>
                  <p className="text-gray-600">{test.created}</p>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h2>
              <ul className="space-y-2">
                {test.tasks.map((task, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Final Decisions Card - Only shown when status is Complete */}
            {currentStatus === 'complete' && finalDecisions && (
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Final Decisions</h2>
                  <button
                    onClick={() => setShowDecisionsModal(true)}
                    className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{finalDecisions}</p>
                </div>
              </div>
            )}

            {/* Results Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Results</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Test Round:</span>
                    <select
                      value={testRoundFilter}
                      onChange={(e) => setTestRoundFilter(e.target.value)}
                      className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Results</option>
                      <option value="1">Round 1 {testId === 'index-creation' ? '' : '(Fixed Order)'}</option>
                      {testId !== 'index-creation' && <option value="2">Round 2 (Randomized)</option>}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {currentStatus === 'complete' ? 'Showing Results From:' : 'Project Status:'}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                      currentStatus === 'planning' ? 'bg-gray-100 text-gray-800' :
                      currentStatus === 'complete' ? 'bg-blue-100 text-blue-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {currentStatus === 'complete' ? 'in progress' : currentStatus}
                    </span>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading results...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Error loading results: {error}</p>
                </div>
              ) : !stats || stats.totalParticipants === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p>No results available yet</p>
                  <p className="text-sm mt-1">0 participants</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Task Performance */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Task Performance</h3>

                    {/* Average Time Bar Graph - Only for Highlights test */}
                    {testId !== 'index-creation' && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Average Time (seconds)</h4>
                        <div className="space-y-3">
                          {['A', 'B', 'C'].map(taskId => {
                            const taskStat = stats.taskStats[taskId];
                            if (!taskStat) return null;

                            const maxTime = Math.max(...Object.values(stats.taskStats).map(t => t.avgTimeSeconds));
                            const widthPercent = (taskStat.avgTimeSeconds / maxTime) * 100;

                            return (
                              <div key={taskId}>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-sm font-medium text-gray-700 w-32">{TASK_NAMES[taskId]}</span>
                                  <div className="flex-1 bg-gray-200 rounded h-8 relative">
                                    <div
                                      className="bg-blue-600 h-8 rounded flex items-center px-3"
                                      style={{ width: `${widthPercent}%` }}
                                    >
                                      <span className="text-sm font-medium text-white">{taskStat.avgTimeSeconds}s</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Average Difficulty Bar Graph - Only for Highlights test */}
                    {testId !== 'index-creation' && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Average Difficulty (1 = Very Difficult, 5 = Very Easy)</h4>
                        <div className="space-y-3">
                          {['A', 'B', 'C'].map(taskId => {
                            const taskStat = stats.taskStats[taskId];
                            if (!taskStat || !taskStat.avgDifficulty) return null;

                            const avgDifficultyNum = typeof taskStat.avgDifficulty === 'string'
                              ? parseFloat(taskStat.avgDifficulty)
                              : taskStat.avgDifficulty;
                            const widthPercent = (avgDifficultyNum / 5) * 100;

                            return (
                              <div key={taskId}>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-sm font-medium text-gray-700 w-32">{TASK_NAMES[taskId]}</span>
                                  <div className="flex-1 bg-gray-200 rounded h-8 relative">
                                    <div
                                      className="bg-green-600 h-8 rounded flex items-center px-3"
                                      style={{ width: `${widthPercent}%` }}
                                    >
                                      <span className="text-sm font-medium text-white">{avgDifficultyNum.toFixed(1)} / 5</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Time vs Difficulty Matrix */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Time vs Difficulty Analysis</h4>

                      {/* Scatter Plot Matrix */}
                      <div className="relative w-full h-96 border border-gray-300 rounded-lg bg-white p-6 mt-8 mb-12">
                        {/* Y-axis label */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-medium text-gray-600 whitespace-nowrap" style={{ transformOrigin: 'center', left: '-90px' }}>
                          Difficulty Rating (1=Very Hard, 5=Very Easy)
                        </div>

                        {/* X-axis label */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap" style={{ bottom: '-30px' }}>
                          Time Spent (seconds)
                        </div>

                        {/* Inner graph area */}
                        <div className="relative w-full h-full overflow-visible">
                          {/* Quadrant backgrounds */}
                          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50"></div>
                          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-50"></div>
                          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-50"></div>
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-orange-50"></div>

                          {/* Grid lines */}
                          <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300"></div>
                          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>

                          {/* Quadrant labels */}
                          <div className="absolute top-2 left-2 text-xs font-medium text-gray-500">
                            Quick<br/>Easy
                          </div>
                          <div className="absolute top-2 right-2 text-xs font-medium text-gray-500 text-right">
                            Slow<br/>Easy
                          </div>
                          <div className="absolute bottom-2 left-2 text-xs font-medium text-gray-500">
                            Quick<br/>Hard
                          </div>
                          <div className="absolute bottom-2 right-2 text-xs font-medium text-gray-500 text-right">
                            Slow<br/>Hard
                          </div>

                          {/* Axis labels - Dynamic based on data */}
                          {(() => {
                            const allTimes = rawData?.taskCompletions?.map(c => c.time_spent_seconds) || [];
                            const minTime = Math.min(...allTimes, 0);
                            const maxTime = Math.max(...allTimes, 300);
                            const midTime = Math.round((minTime + maxTime) / 2);

                            return (
                              <>
                                <div className="absolute -bottom-6 left-0 text-xs text-gray-500">{minTime}s</div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">{midTime}s</div>
                                <div className="absolute -bottom-6 right-0 text-xs text-gray-500">{maxTime}s</div>
                              </>
                            );
                          })()}
                          <div className="absolute -top-5 -left-8 text-xs text-gray-500">5</div>
                          <div className="absolute top-1/2 -translate-y-1/2 -left-8 text-xs text-gray-500">3</div>
                          <div className="absolute bottom-0 -left-8 text-xs text-gray-500">1</div>

                          {/* Plot points - Individual Results */}
                          {rawData && rawData.taskCompletions && (() => {
                            const allTimes = rawData.taskCompletions.map(c => c.time_spent_seconds);
                            const minTime = Math.min(...allTimes, 0);
                            const maxTime = Math.max(...allTimes, 300);
                            const timeRange = maxTime - minTime || 1;

                            return rawData.taskCompletions.map((completion, index) => {
                              // Calculate position based on time (X) and difficulty (Y)
                              const timeSpent = completion.time_spent_seconds;
                              const difficulty = completion.difficulty_rating; // 1-5 scale

                              // X-axis: Time spent (normalized to 0-100%)
                              const x = ((timeSpent - minTime) / timeRange) * 100;

                              // Y-axis: Difficulty rating (inverted so 5 is at top, 1 is at bottom)
                              // Map 1-5 to 100-0% (CSS positioning)
                              const y = ((5 - difficulty) / 4) * 100;

                              // Task colors for borders (red, blue, green)
                              const borderColors = {
                                A: 'border-red-600',
                                B: 'border-blue-600',
                                C: 'border-green-600'
                              };

                              // Success/failure colors for fill (red, blue, green)
                              const taskColors = {
                                A: completion.actual_success ? 'bg-red-600' : 'bg-red-200',
                                B: completion.actual_success ? 'bg-blue-600' : 'bg-blue-200',
                                C: completion.actual_success ? 'bg-green-600' : 'bg-green-200'
                              };

                              // Show dot visibility based on hover state
                              let isVisible = true;
                              let isHighlighted = false;

                              if (testId === 'index-creation') {
                                // For index-creation: highlight hovered participant
                                if (hoveredParticipant) {
                                  isHighlighted = completion.session_id === hoveredParticipant;
                                }
                              } else {
                                // For highlights: show only dots matching hovered task
                                isVisible = !hoveredTask || hoveredTask === completion.task_id;
                              }

                              // For index-creation, use black dots normally, red when hovered
                              let dotColor, dotBorder;
                              if (testId === 'index-creation') {
                                // Successful: solid fill, Unsuccessful: outline only
                                if (completion.actual_success) {
                                  dotColor = isHighlighted ? 'bg-red-600' : 'bg-black';
                                  dotBorder = 'border-0';
                                } else {
                                  dotColor = 'bg-white';
                                  dotBorder = isHighlighted ? 'border-2 border-red-600' : 'border-2 border-black';
                                }
                              } else {
                                dotColor = taskColors[completion.task_id];
                                dotBorder = `${borderColors[completion.task_id]} border-2`;
                              }

                              return (
                                <div
                                  key={`${completion.session_id}-${completion.task_id}-${index}`}
                                  className="absolute transition-all duration-200"
                                  style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: `translate(-50%, -50%) ${isHighlighted ? 'scale(1.3)' : 'scale(1)'}`,
                                    opacity: isVisible ? 1 : 0,
                                    zIndex: isHighlighted ? 10 : 1
                                  }}
                                  title={`${TASK_NAMES[completion.task_id]}: ${timeSpent}s, Difficulty ${difficulty}/5, ${completion.actual_success ? 'Success' : 'Failure'}`}
                                >
                                  <div className={`w-3 h-3 ${dotColor} rounded-full shadow-md ${dotBorder}`}>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Color Legend */}
                      <div className="flex items-center justify-center gap-6 text-sm mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                          <span className="text-gray-600">Success</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-200 rounded-full border-2 border-gray-600"></div>
                          <span className="text-gray-600">Failure</span>
                        </div>
                      </div>

                      {/* Detailed Results */}
                      {testId === 'index-creation' ? (
                        /* Index Creation: Flat participant list with hover */
                        <div className="text-sm space-y-2">
                          <div className="border-t border-gray-200 pt-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">All Participants</h5>
                            <div className="space-y-2">
                              {rawData?.taskCompletions?.map((completion, idx) => {
                                const session = rawData?.sessions?.find(s => s.id === completion.session_id);
                                const isHovered = hoveredParticipant === completion.session_id;

                                return (
                                  <div
                                    key={`${completion.session_id}-${idx}`}
                                    className={`flex items-center justify-between text-xs p-2 rounded transition-colors cursor-pointer ${
                                      isHovered ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 border border-gray-200'
                                    }`}
                                    onMouseEnter={() => setHoveredParticipant(completion.session_id)}
                                    onMouseLeave={() => setHoveredParticipant(null)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-gray-600 font-medium">Participant {idx + 1}</span>
                                    </div>
                                    <div className="flex gap-4">
                                      <div>
                                        <span className="text-gray-600">Self-Reported: </span>
                                        <span className={completion.self_reported_success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                          {completion.self_reported_success ? 'Success' : 'Failure'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Actual: </span>
                                        <span className={completion.actual_success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                          {completion.actual_success ? 'Success' : 'Failure'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Time: </span>
                                        <span className="font-medium">{completion.time_spent_seconds}s</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Difficulty: </span>
                                        <span className="font-medium">{completion.difficulty_rating}/5</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Highlights: Expandable by method */
                        <div className="text-sm space-y-2">
                          {['A', 'B', 'C'].map(taskId => {
                            const taskStat = stats.taskStats[taskId];
                            if (!taskStat) return null;

                            const taskCompletions = rawData?.taskCompletions?.filter(tc => tc.task_id === taskId) || [];
                            const isExpanded = expandedTasks[taskId];

                            return (
                              <div
                                key={taskId}
                                className="border-t border-gray-200 py-2"
                                onMouseEnter={() => setHoveredTask(taskId)}
                                onMouseLeave={() => setHoveredTask(null)}
                              >
                                {/* Average Row */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))}
                                      className="text-gray-600 hover:text-gray-900"
                                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                    >
                                      <svg
                                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                    <div className={`w-3 h-3 rounded-full ${taskId === 'A' ? 'bg-red-600' : taskId === 'B' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
                                    <span className="font-medium text-gray-900">{TASK_NAMES[taskId]} (Average)</span>
                                  </div>
                                  <div className="flex gap-6 text-sm">
                                    <div>
                                      <span className="text-gray-600">Self-Reported: </span>
                                      <span className="font-medium">{taskStat.selfReportedSuccessRate}%</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Actual: </span>
                                      <span className="font-medium">{taskStat.actualSuccessRate}%</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">({taskStat.totalAttempts} completions)</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Individual Participant Details */}
                                {isExpanded && taskCompletions.length > 0 && (
                                  <div className="mt-2 ml-6 space-y-2">
                                    {taskCompletions.map((completion, idx) => {
                                      // Find session for this completion to get presentation order
                                      const session = rawData?.sessions?.find(s => s.id === completion.session_id);

                                      return (
                                        <div key={`${completion.session_id}-${idx}`} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                          <div className="flex items-center gap-3">
                                            <span className="text-gray-600">Participant {idx + 1}</span>
                                            {session?.presentation_order && (
                                              <span className="text-gray-500 text-xs">({session.presentation_order})</span>
                                            )}
                                          </div>
                                          <div className="flex gap-4">
                                            <div>
                                              <span className="text-gray-600">Self-Reported: </span>
                                              <span className={completion.self_reported_success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                {completion.self_reported_success ? 'Success' : 'Failure'}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Actual: </span>
                                              <span className={completion.actual_success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                {completion.actual_success ? 'Success' : 'Failure'}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Time: </span>
                                              <span className="font-medium">{completion.time_spent_seconds}s</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Difficulty: </span>
                                              <span className="font-medium">{completion.difficulty_rating}/5</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Method Preference */}
                  {stats.preferenceStats && stats.preferenceStats.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Method Preference</h3>
                      <div className="space-y-2">
                        {stats.preferenceStats.sort((a, b) => b.count - a.count).map(pref => (
                          <div key={pref.method} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-32">{TASK_NAMES[pref.method] || pref.method}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div
                                className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                                style={{ width: `${pref.percentage}%` }}
                              >
                                <span className="text-xs font-medium text-white">{pref.percentage}%</span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">{pref.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observation Summary */}
                  {observations && observations.length > 0 && rawData?.sessions && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Observation Summary</h3>
                      <div className="space-y-2">
                        {observations
                          .map(obs => {
                            // Only count participants that are in the filtered sessions
                            const filteredSessionIds = rawData.sessions.map(s => s.id);
                            const filteredParticipantIds = (obs.participantIds || []).filter(id => filteredSessionIds.includes(id));
                            const count = filteredParticipantIds.length;
                            return { ...obs, count };
                          })
                          .sort((a, b) => b.count - a.count)
                          .map(obs => (
                            <div key={obs.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                              <span className="text-sm text-gray-700 flex-1">{obs.text}</span>
                              <span className={`text-sm font-medium ml-4 ${obs.count === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                                {obs.count} {obs.count === 1 ? 'participant' : 'participants'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={`${test.url}?status=${encodeURIComponent(currentStatus)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Launch Test
                  {currentStatus === 'complete' && (
                    <span className="block text-xs text-blue-100 mt-1">
                      (Preview - results won't be shown)
                    </span>
                  )}
                </a>
                {currentStatus === 'planning' && (
                  <button
                    onClick={() => handleStatusChange('in progress')}
                    className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Move to In Progress
                  </button>
                )}
                {currentStatus === 'in progress' && (
                  <button
                    onClick={showChangeStatusOptions}
                    className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Change Status
                  </button>
                )}
                {currentStatus === 'complete' && (
                  <button
                    onClick={showChangeStatusOptions}
                    className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Change Status
                  </button>
                )}
                <button
                  onClick={handleExportResults}
                  disabled={loading || !stats || stats.totalParticipants === 0}
                  className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Results
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Participants:</span>
                    <span className="font-medium">
                      {loading ? '...' : stats ? stats.totalParticipants : 0}
                    </span>
                  </div>
                  {testId === 'index-creation' ? (
                    <>
                      <div className="flex justify-between">
                        <span>Avg. Time:</span>
                        <span className="font-medium">
                          {loading || !stats || stats.totalParticipants === 0 ? '-' : (() => {
                            const taskStat = stats.taskStats['A'];
                            if (!taskStat) return '-';
                            const minutes = Math.floor(taskStat.avgTimeSeconds / 60);
                            const seconds = taskStat.avgTimeSeconds % 60;
                            return `${minutes}:${String(seconds).padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Difficulty:</span>
                        <span className="font-medium">
                          {loading || !stats || stats.totalParticipants === 0 ? '-' :
                            stats.taskStats['A'] ? `${stats.taskStats['A'].avgDifficulty} / 5` : '-'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>Avg. Total Time:</span>
                      <span className="font-medium">
                        {loading || !stats || stats.totalParticipants === 0 ? '-' : (() => {
                          const totalSeconds = Object.values(stats.taskStats).reduce((sum, task) => sum + task.avgTimeSeconds, 0);
                          const minutes = Math.floor(totalSeconds / 60);
                          const seconds = totalSeconds % 60;
                          return `${minutes}:${String(seconds).padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Participants & Observations Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants & Observations</h3>

              {loading ? (
                <p className="text-sm text-gray-500 text-center py-4">Loading participants...</p>
              ) : !rawData || !rawData.sessions || rawData.sessions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No participants yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(() => {
                    const sorted = [...rawData.sessions].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
                    console.log('Sorted sessions:', sorted.map(s => ({ id: s.id.slice(0, 8), completed_at: s.completed_at })));
                    return sorted;
                  })().map((session, idx) => {
                    const surveyResponse = rawData.surveyResponses?.find(sr => sr.session_id === session.id);
                    const linkedObs = observations.filter(obs => obs.participantIds?.includes(session.id));

                    // For index-creation test, get survey responses from validation_data
                    const validationData = rawData.validationData?.find(vd => vd.session_id === session.id);
                    const indexCreationResponses = validationData?.validation_data?.surveyResponses;

                    return (
                      <div key={session.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">Participant {idx + 1}</span>
                              {session.recording_error && !session.recording_url && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded" title="Recording failed">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  No Recording
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(session.completed_at).toLocaleDateString()} {new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {session.recording_url && (
                            <button
                              onClick={() => openVideoModalWithParticipant(session)}
                              className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm"
                            >
                              View Recording
                            </button>
                          )}
                        </div>

                        {/* Recording Error Details */}
                        {session.recording_error && !session.recording_url && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <div className="font-medium text-red-900 mb-1">Recording Error:</div>
                            <div className="text-red-700">
                              {(() => {
                                try {
                                  const errorData = JSON.parse(session.recording_error);
                                  return errorData.message || errorData.error || 'Unknown error';
                                } catch {
                                  return session.recording_error;
                                }
                              })()}
                            </div>
                          </div>
                        )}

                        {linkedObs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="text-xs font-medium text-gray-600">Observations:</span>
                            {linkedObs.map(obs => (
                              <div key={obs.id} className="text-sm text-gray-700 pl-2">
                                • {obs.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Survey responses for Highlights test */}
                        {surveyResponse && surveyResponse.preferred_method && (
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
                              surveyResponse.preferred_method === 'A' ? 'bg-red-100 text-red-800 border-red-200' :
                              surveyResponse.preferred_method === 'B' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            }`}>
                              Preferred: {TASK_NAMES[surveyResponse.preferred_method]}
                            </span>
                            <p className="text-sm text-gray-600 mt-1 italic">"{surveyResponse.preference_reason}"</p>
                          </div>
                        )}

                        {/* Survey responses for Index Creation test */}
                        {indexCreationResponses && indexCreationResponses.length > 0 && (
                          <div className="mt-2 space-y-2">
                            <span className="text-xs font-medium text-gray-600">Feedback:</span>
                            {indexCreationResponses.map((response, respIdx) => {
                              // Only show the text input questions (confusing and workedWell)
                              if (response.questionId === 'most-confusing' || response.questionId === 'what-worked-well') {
                                return (
                                  <div key={respIdx} className="bg-gray-50 p-2 rounded text-xs">
                                    <div className="font-medium text-gray-700 mb-1">{response.questionText}</div>
                                    <div className="text-gray-600 italic">"{response.answer}"</div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}

                        <div className="mt-3 flex justify-start">
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete this participant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {confirmModal.type === 'change-status-options' ? 'Change Status' : 'Confirm Status Change'}
            </h3>
            <p className="text-gray-600 mb-6">{confirmModal.message}</p>

            {confirmModal.type === 'change-status-options' ? (
              <div className="space-y-3">
                {confirmModal.currentStatus === 'in progress' && (
                  <>
                    <button
                      onClick={() => {
                        setConfirmModal(null);
                        handleStatusChange('planning');
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Move to Planning
                    </button>
                    <button
                      onClick={() => {
                        setConfirmModal(null);
                        handleStatusChange('complete');
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                    >
                      Move to Complete
                    </button>
                  </>
                )}
                {confirmModal.currentStatus === 'complete' && (
                  <>
                    <button
                      onClick={() => {
                        setConfirmModal(null);
                        handleStatusChange('planning');
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Move to Planning
                    </button>
                    <button
                      onClick={() => {
                        setConfirmModal(null);
                        handleStatusChange('in progress');
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Move to In Progress
                    </button>
                  </>
                )}
                <button
                  onClick={() => setConfirmModal(null)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmStatusChange()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Decisions Modal */}
      {showDecisionsModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Record Final Decisions</h3>
            <p className="text-gray-600 mb-4">
              Document your final decisions based on the test results. When marked as complete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
              <li>Results will continue to show data from the "In Progress" phase</li>
              <li>The launch test button stays active for team preview</li>
              <li>New test sessions won't be displayed in results</li>
            </ul>
            {finalDecisions && <p className="text-sm text-blue-600 mb-4">You previously recorded decisions. You can update them below.</p>}
            <textarea
              value={finalDecisions}
              onChange={(e) => setFinalDecisions(e.target.value)}
              placeholder="Enter your final decisions and conclusions from this test..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowDecisionsModal(false);
                  setFinalDecisions(finalDecisions); // Reset to previous value if cancelled
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFinalDecisions}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Save & Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raw Data Modal */}
      {showRawData && rawData && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Raw Data</h2>
              <button
                onClick={() => setShowRawData(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-auto">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `highlights-test-raw-data-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Download JSON
              </button>
              <button
                onClick={() => setShowRawData(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal with Observations */}
      {videoModalSession && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Screen Recording</h2>
                <p className="text-sm text-gray-500">
                  Participant {rawData?.sessions?.findIndex(s => s.id === videoModalSession.id) + 1} - {new Date(videoModalSession.completed_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setVideoModalSession(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left: Video Player (60%) */}
              <div className="flex-1 bg-black flex flex-col p-4">
                {/* Playback Speed Controls */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white text-sm font-medium">Speed:</span>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Video Player */}
                <div className="flex-1 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoModalSession.recording_url}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[calc(90vh-240px)] object-contain"
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Right: Observations Panel (40%) */}
              <div className="w-96 border-l border-gray-200 bg-gray-50 p-4 flex flex-col overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observations</h3>

                {/* Add Observation Section */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Observation</label>
                  <input
                    value={selectedObservationText}
                    onChange={(e) => {
                      setSelectedObservationText(e.target.value);
                      setShowObservationDropdown(true);
                    }}
                    onFocus={() => setShowObservationDropdown(true)}
                    onBlur={() => {
                      // Delay hiding to allow click on dropdown item
                      setTimeout(() => setShowObservationDropdown(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && selectedObservationText.trim()) {
                        linkObservationToParticipant(videoModalSession.id, selectedObservationText);
                        setShowObservationDropdown(false);
                      } else if (e.key === 'Escape') {
                        setShowObservationDropdown(false);
                      }
                    }}
                    placeholder="Type or select observation..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Smart Dropdown */}
                  {showObservationDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {(() => {
                        const filtered = observations.filter(obs =>
                          obs.text.toLowerCase().includes(selectedObservationText.toLowerCase())
                        );
                        const exactMatch = observations.some(obs =>
                          obs.text.toLowerCase() === selectedObservationText.toLowerCase()
                        );

                        return (
                          <>
                            {filtered.length > 0 && (
                              <>
                                {filtered.map(obs => {
                                  const isAlreadyLinked = obs.participantIds?.includes(videoModalSession.id);

                                  return (
                                    <button
                                      key={obs.id}
                                      onClick={() => {
                                        if (!isAlreadyLinked) {
                                          linkObservationToParticipant(videoModalSession.id, obs.text);
                                          setShowObservationDropdown(false);
                                        }
                                      }}
                                      disabled={isAlreadyLinked}
                                      className={`w-full px-3 py-2 text-left text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                                        isAlreadyLinked
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'hover:bg-blue-50'
                                      }`}
                                    >
                                      {obs.text}
                                      <span className="text-xs text-gray-500 ml-2">
                                        {isAlreadyLinked
                                          ? '(already linked)'
                                          : `(${obs.participantIds?.length || 0} linked)`
                                        }
                                      </span>
                                    </button>
                                  );
                                })}
                              </>
                            )}
                            {selectedObservationText.trim() && !exactMatch && (
                              <button
                                onClick={() => {
                                  linkObservationToParticipant(videoModalSession.id, selectedObservationText);
                                  setShowObservationDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-blue-700 font-medium hover:bg-blue-50 transition-colors border-t border-gray-200"
                              >
                                Add "{selectedObservationText}"
                              </button>
                            )}
                            {filtered.length === 0 && !selectedObservationText.trim() && (
                              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                Start typing to add an observation
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Linked Observations List */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Linked Observations</h4>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {observations
                      .filter(obs => obs.participantIds?.includes(videoModalSession.id))
                      .map(obs => (
                        <div key={obs.id} className="flex items-start justify-between gap-2 p-2 bg-white rounded border border-gray-200">
                          <span className="text-sm text-gray-700 flex-1">{obs.text}</span>
                          <button
                            onClick={() => unlinkObservationFromParticipant(videoModalSession.id, obs.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            title="Unlink observation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    {observations.filter(obs => obs.participantIds?.includes(videoModalSession.id)).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No observations linked yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Use the video controls to play, pause, and adjust volume. Link observations to this participant while watching. Press ESC or click the X to close.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDetail;
