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
    status: 'Active',
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

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const data = await fetchTestResults(testId);
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
  }, [testId]);

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
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {test.status}
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

            {/* Results Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
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

                    {/* Success Quadrant Matrix */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Success Comparison</h4>

                      {/* Scatter Plot Matrix */}
                      <div className="relative w-full h-96 border border-gray-300 rounded-lg bg-white p-6 mt-8 mb-12">
                        {/* Y-axis label */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-xs font-medium text-gray-600 whitespace-nowrap" style={{ transformOrigin: 'center', left: '-90px' }}>
                          Actual Success Rate (%)
                        </div>

                        {/* X-axis label */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap" style={{ bottom: '-30px' }}>
                          Self-Reported Success Rate (%)
                        </div>

                        {/* Inner graph area */}
                        <div className="relative w-full h-full overflow-visible">
                          {/* Quadrant backgrounds */}
                          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-50"></div>
                          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-50"></div>
                          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-50"></div>
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-50"></div>

                          {/* Grid lines */}
                          <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300"></div>
                          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300"></div>

                          {/* Quadrant labels */}
                          <div className="absolute top-2 left-2 text-xs font-medium text-gray-500">
                            High Confidence<br/>Low Success
                          </div>
                          <div className="absolute top-2 right-2 text-xs font-medium text-gray-500 text-right">
                            High Confidence<br/>High Success
                          </div>
                          <div className="absolute bottom-2 left-2 text-xs font-medium text-gray-500">
                            Low Confidence<br/>Low Success
                          </div>
                          <div className="absolute bottom-2 right-2 text-xs font-medium text-gray-500 text-right">
                            Low Confidence<br/>High Success
                          </div>

                          {/* Axis labels */}
                          <div className="absolute -bottom-6 left-0 text-xs text-gray-500">0%</div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">50%</div>
                          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">100%</div>
                          <div className="absolute -top-5 -left-8 text-xs text-gray-500">100%</div>
                          <div className="absolute top-1/2 -translate-y-1/2 -left-8 text-xs text-gray-500">50%</div>
                          <div className="absolute bottom-0 -left-8 text-xs text-gray-500">0%</div>

                          {/* Plot points - Individual Results */}
                          {rawData && rawData.taskCompletions && rawData.taskCompletions.map((completion, index) => {
                            // Get validation data for this completion to use actual percentages
                            const validationData = rawData.validationData?.find(
                              v => v.session_id === completion.session_id && v.task_id === completion.task_id
                            );

                            // Use actual completion percentages from validation data
                            const actualCompletionPercent = validationData?.validation_data?.completionPercentage || 0;
                            const selfReportedPercent = completion.self_reported_success ? 100 : 0;

                            const x = selfReportedPercent;
                            const y = 100 - actualCompletionPercent; // Invert for CSS positioning

                            const colors = {
                              A: 'bg-blue-600',
                              B: 'bg-orange-600',
                              C: 'bg-purple-600'
                            };

                            const borderColors = {
                              A: 'border-blue-600',
                              B: 'border-orange-600',
                              C: 'border-purple-600'
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
                                title={`Task ${completion.task_id}: Self-reported ${completion.self_reported_success ? 'Success' : 'Failure'}, Actual ${actualCompletionPercent}% completion`}
                              >
                                <div className={`w-3 h-3 ${colors[completion.task_id]} rounded-full shadow-md ${borderColors[completion.task_id]} border-2`}>
                                </div>
                              </div>
                            );
                          })}
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
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={test.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Launch Test
                </a>
                <button
                  onClick={handleExportResults}
                  disabled={loading || !stats || stats.totalParticipants === 0}
                  className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Results
                </button>
                <button
                  onClick={handleViewRawData}
                  disabled={loading || !rawData}
                  className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View Raw Data
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
          </div>
        </div>
      </main>

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
