import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchTestResults, calculateStatistics } from '../lib/supabase';

const testData = {
  highlights: {
    title: 'Birth Record Highlights',
    description: 'A/B testing different methods of highlighting information on historical birth records',
    objective: 'Compare three different highlighting methods to determine which provides the best user experience for extracting information from historical documents.',
    tasks: [
      'Task A: Manual highlight with attach/detach buttons',
      'Task B: Field-focused highlighting with automatic attachment',
      'Task C: Simple highlight mode for general information',
    ],
    created: 'November 2025',
    status: 'in progress',
    participants: 0,
    url: 'https://highlight-user-test.vercel.app/',
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
  const [confirmModal, setConfirmModal] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(test?.status || 'planning');
  const [finalDecisions, setFinalDecisions] = useState('');
  const [showDecisionsModal, setShowDecisionsModal] = useState(false);
  const [observations, setObservations] = useState([]);
  const [newObservation, setNewObservation] = useState('');
  const [editingObservation, setEditingObservation] = useState(null);

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

  // Load observations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('projectObservations');
    if (saved) {
      try {
        const allObservations = JSON.parse(saved);
        if (allObservations[testId]) {
          setObservations(allObservations[testId]);
        }
      } catch (err) {
        console.error('Error loading observations:', err);
      }
    }
  }, [testId]);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        // When status is complete, always show in progress results
        const statusFilter = currentStatus === 'complete' ? 'in progress' : currentStatus;
        const data = await fetchTestResults(testId, statusFilter);
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

    if (testId) {
      loadResults();
    }
  }, [testId, currentStatus]);

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
        csv += `Task ${taskId},${taskStat.avgTimeSeconds},${taskStat.avgDifficulty},${taskStat.selfReportedSuccessRate},${taskStat.actualSuccessRate},${taskStat.totalAttempts}\n`;
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

    // Moving from in progress to planning
    if (currentStatus === 'in progress' && newStatus === 'planning') {
      setConfirmModal({
        testId,
        newStatus,
        currentStatus,
        message: 'Moving back to "Planning" will hide results collected during the "in progress" phase. They will reappear when you move back to "In Progress".',
        type: 'single-confirm',
      });
      return;
    }

    // Default confirmation
    setConfirmModal({
      testId,
      newStatus,
      currentStatus,
      message: `Change project status to "${newStatus}"? This will filter results to only show data collected during the ${newStatus} phase.`,
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

  const saveObservations = (updatedObservations) => {
    try {
      const saved = localStorage.getItem('projectObservations');
      const allObservations = saved ? JSON.parse(saved) : {};
      allObservations[testId] = updatedObservations;
      localStorage.setItem('projectObservations', JSON.stringify(allObservations));
      setObservations(updatedObservations);
    } catch (err) {
      console.error('Error saving observations:', err);
      alert('Failed to save observations: ' + err.message);
    }
  };

  const handleAddObservation = () => {
    if (!newObservation.trim()) return;

    const observation = {
      id: Date.now(),
      text: newObservation.trim(),
      tally: 1,
      createdAt: new Date().toISOString(),
    };

    const updatedObservations = [...observations, observation];
    saveObservations(updatedObservations);
    setNewObservation('');
  };

  const handleIncrementTally = (id) => {
    const updatedObservations = observations.map(obs =>
      obs.id === id ? { ...obs, tally: obs.tally + 1 } : obs
    );
    saveObservations(updatedObservations);
  };

  const handleEditObservation = (id, newText) => {
    if (!newText.trim()) return;

    const updatedObservations = observations.map(obs =>
      obs.id === id ? { ...obs, text: newText.trim() } : obs
    );
    saveObservations(updatedObservations);
    setEditingObservation(null);
  };

  const handleDeleteObservation = (id) => {
    if (!confirm('Are you sure you want to delete this observation?')) return;

    const updatedObservations = observations.filter(obs => obs.id !== id);
    saveObservations(updatedObservations);
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Showing:</span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
                    (currentStatus === 'complete' || currentStatus === 'in progress') ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentStatus === 'complete' ? 'in progress' : currentStatus} phase
                  </span>
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

                    {/* Average Time Bar Graph */}
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
                                <span className="text-sm font-medium text-gray-700 w-16">Task {taskId}</span>
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

                    {/* Average Difficulty Bar Graph */}
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
                                <span className="text-sm font-medium text-gray-700 w-16">Task {taskId}</span>
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

                              // Task colors for borders
                              const borderColors = {
                                A: 'border-blue-600',
                                B: 'border-orange-600',
                                C: 'border-purple-600'
                              };

                              // Success/failure colors for fill
                              const taskColors = {
                                A: completion.actual_success ? 'bg-blue-600' : 'bg-blue-200',
                                B: completion.actual_success ? 'bg-orange-600' : 'bg-orange-200',
                                C: completion.actual_success ? 'bg-purple-600' : 'bg-purple-200'
                              };

                              // Show dot only if no task is hovered OR if this dot's task matches the hovered task
                              const isVisible = !hoveredTask || hoveredTask === completion.task_id;

                              return (
                                <div
                                  key={`${completion.session_id}-${completion.task_id}-${index}`}
                                  className="absolute transition-opacity duration-200"
                                  style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    opacity: isVisible ? 1 : 0
                                  }}
                                  title={`Task ${completion.task_id}: ${timeSpent}s, Difficulty ${difficulty}/5, ${completion.actual_success ? 'Success' : 'Failure'}`}
                                >
                                  <div className={`w-3 h-3 ${taskColors[completion.task_id]} rounded-full shadow-md ${borderColors[completion.task_id]} border-2`}>
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
                          <div className="w-3 h-3 bg-gray-200 rounded-full border border-gray-300"></div>
                          <span className="text-gray-600">Failure</span>
                        </div>
                      </div>

                      {/* Detailed Results - Averages with Expandable Individual Results */}
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
                                  <div className={`w-3 h-3 rounded-full ${taskId === 'A' ? 'bg-blue-600' : taskId === 'B' ? 'bg-orange-600' : 'bg-purple-600'}`}></div>
                                  <span className="font-medium text-gray-900">Task {taskId} (Average)</span>
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
                                  {taskCompletions.map((completion, idx) => (
                                    <div key={`${completion.session_id}-${idx}`} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                      <span className="text-gray-600">Participant {idx + 1}</span>
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
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Method Preference */}
                  {stats.preferenceStats && stats.preferenceStats.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Method Preference</h3>
                      <div className="space-y-2">
                        {stats.preferenceStats.sort((a, b) => b.count - a.count).map(pref => (
                          <div key={pref.method} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 w-16">{pref.method}</span>
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

                  {/* Preference Reasons */}
                  {stats.preferenceReasons && stats.preferenceReasons.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Why They Preferred It</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {stats.preferenceReasons.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded border-l-2 border-blue-500">
                            <p className="text-xs font-medium text-blue-600 mb-1">Preferred Task {item.method}</p>
                            <p className="text-sm text-gray-700">{item.reason}</p>
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
                {currentStatus !== 'complete' ? (
                  <a
                    href={test.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Launch Test
                  </a>
                ) : (
                  <div className="w-full px-4 py-2 text-center text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">
                    Launch Test (Disabled - Complete)
                  </div>
                )}
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
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-medium">
                      {loading || !stats || stats.totalParticipants === 0 ? '-' : '100%'}
                    </span>
                  </div>
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
                </div>
              </div>
            </div>

            {/* Manual Observations Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Observations</h3>

              {/* Add new observation */}
              <div className="mb-4">
                <textarea
                  value={newObservation}
                  onChange={(e) => setNewObservation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddObservation();
                    }
                  }}
                  placeholder="Add an observation..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
                <button
                  onClick={handleAddObservation}
                  disabled={!newObservation.trim()}
                  className="mt-2 w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Add Observation
                </button>
              </div>

              {/* Observations list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {observations
                  .sort((a, b) => b.tally - a.tally)
                  .map((obs) => (
                    <div key={obs.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {editingObservation === obs.id ? (
                        <div className="space-y-2">
                          <textarea
                            defaultValue={obs.text}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleEditObservation(obs.id, e.target.value);
                              }
                              if (e.key === 'Escape') {
                                setEditingObservation(null);
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                                handleEditObservation(obs.id, textarea.value);
                              }}
                              className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingObservation(null)}
                              className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm text-gray-700 flex-1">{obs.text}</p>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingObservation(obs.id)}
                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteObservation(obs.id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleIncrementTally(obs.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add Tally
                            </button>
                            <span className="text-xs font-semibold text-gray-600">
                              {obs.tally} {obs.tally === 1 ? 'mention' : 'mentions'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                {observations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No observations yet. Add one above!
                  </p>
                )}
              </div>
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
              Document your final decisions based on the test results. This will be saved and displayed when the project is marked as complete.
              {finalDecisions && <span className="block mt-2 text-sm text-blue-600">You previously recorded decisions. You can update them below.</span>}
            </p>
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
    </div>
  );
};

export default TestDetail;
