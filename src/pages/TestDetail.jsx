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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const data = await fetchTestResults(testId);
        const statistics = calculateStatistics(data);
        setStats(statistics);
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
                    <div className="space-y-4">
                      {['A', 'B', 'C'].map(taskId => {
                        const taskStat = stats.taskStats[taskId];
                        if (!taskStat) return null;

                        return (
                          <div key={taskId} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-gray-900">Task {taskId}</h4>
                              <span className="text-sm text-gray-500">{taskStat.totalAttempts} completions</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Avg Time:</p>
                                <p className="font-medium">{Math.floor(taskStat.avgTimeSeconds / 60)}:{String(taskStat.avgTimeSeconds % 60).padStart(2, '0')}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Avg Difficulty:</p>
                                <p className="font-medium">{taskStat.avgDifficulty} / 5</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Self-Reported Success:</p>
                                <p className="font-medium">{taskStat.selfReportedSuccessRate}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Actual Success:</p>
                                <p className="font-medium">{taskStat.actualSuccessRate}%</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                <button className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Export Results
                </button>
                <button className="w-full px-4 py-2 text-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
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
    </div>
  );
};

export default TestDetail;
