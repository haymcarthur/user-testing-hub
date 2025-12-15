import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const tests = [
  {
    id: 'highlights',
    title: 'Birth Record Highlights',
    description: 'A/B testing different methods of highlighting information on historical birth records',
    status: 'in progress',
    created: 'Nov 2025',
    participants: 0, // Will be dynamic later
    url: 'https://highlight-user-test.vercel.app/',
  },
  {
    id: 'index-creation',
    title: 'Index Creation Study',
    description: 'Testing the interface for adding people to household groups in census records',
    status: 'planning',
    created: 'Dec 2025',
    participants: 0, // Will be dynamic later
    url: 'https://index-creation-haylee-mcarthurs-projects.vercel.app/',
  },
  // Add more tests here as needed
];

const Dashboard = () => {
  const [participantCounts, setParticipantCounts] = useState({});
  const [activeTab, setActiveTab] = useState('planning');
  const [statusOverrides, setStatusOverrides] = useState({});
  const [confirmModal, setConfirmModal] = useState(null);

  // Load status overrides from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('projectStatuses');
    if (saved) {
      try {
        setStatusOverrides(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading status overrides:', err);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchParticipantCounts() {
      try {
        const { data, error } = await supabase
          .from('test_sessions')
          .select('test_id')
          .not('completed_at', 'is', null);

        if (error) throw error;

        const counts = data.reduce((acc, session) => {
          acc[session.test_id] = (acc[session.test_id] || 0) + 1;
          return acc;
        }, {});

        setParticipantCounts(counts);
      } catch (err) {
        console.error('Error fetching participant counts:', err);
      }
    }

    fetchParticipantCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchParticipantCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authenticated');
    window.location.reload();
  };

  const handleStatusChange = (testId, newStatus, currentStatus) => {
    setConfirmModal({
      testId,
      newStatus,
      currentStatus,
      message: `Change project status to "${newStatus}"? This will filter results to only show data collected during the ${newStatus} phase.`,
      type: 'single-confirm',
    });
  };

  const confirmStatusChange = async () => {
    if (!confirmModal) return;

    try {
      // Update status in localStorage
      const newOverrides = {
        ...statusOverrides,
        [confirmModal.testId]: confirmModal.newStatus,
      };
      setStatusOverrides(newOverrides);
      localStorage.setItem('projectStatuses', JSON.stringify(newOverrides));

      setConfirmModal(null);
    } catch (err) {
      console.error('Error changing status:', err);
      alert('Failed to change status: ' + err.message);
    }
  };

  const tabs = ['planning', 'in progress', 'complete'];

  // Apply status overrides to tests
  const testsWithStatus = tests.map(test => ({
    ...test,
    status: statusOverrides[test.id] || test.status,
  }));

  const filteredTests = testsWithStatus.filter(test => test.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Testing Hub</h1>
            <p className="text-sm text-gray-600 mt-1">Research & Testing Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-600">Select a test to view documentation, results, or launch the test</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    test.status === 'planning' ? 'bg-gray-100 text-gray-800' :
                    test.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {test.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{test.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>Created: {test.created}</span>
                  <span>•</span>
                  <span>{participantCounts[test.id] || 0} participants</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/test/${test.id}`}
                    className="flex-1 px-4 py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                  <a
                    href={test.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Launch Test
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if no tests */}
        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tests in this status</p>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm Status Change</h3>
            <p className="text-gray-600 mb-6">{confirmModal.message}</p>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
