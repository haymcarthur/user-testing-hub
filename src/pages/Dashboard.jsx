import { Link } from 'react-router-dom';

const tests = [
  {
    id: 'highlights',
    title: 'Birth Record Highlights',
    description: 'A/B testing different methods of highlighting information on historical birth records',
    status: 'Active',
    created: 'Nov 2025',
    participants: 0, // Will be dynamic later
    url: 'https://highlight-user-test.vercel.app/',
  },
  // Add more tests here as needed
];

const Dashboard = () => {
  const handleLogout = () => {
    sessionStorage.removeItem('authenticated');
    window.location.reload();
  };

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Active Tests</h2>
          <p className="text-gray-600">Select a test to view documentation, results, or launch the test</p>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {test.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{test.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span>Created: {test.created}</span>
                  <span>•</span>
                  <span>{test.participants} participants</span>
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
        {tests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tests available yet</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
