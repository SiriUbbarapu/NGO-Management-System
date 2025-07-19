import React, { useState } from 'react';
import { familiesAPI, testConnection, checkAuthStatus } from '../services/apiDebug';
import { useAuth } from '../contexts/AuthContext';

const DebugPanel = () => {
  const [debugResults, setDebugResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFunction();
      setDebugResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result, error: null }
      }));
      console.log(`✅ Test passed: ${testName}`, result);
    } catch (error) {
      setDebugResults(prev => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.message }
      }));
      console.error(`❌ Test failed: ${testName}`, error);
    } finally {
      setLoading(false);
    }
  };

  const tests = {
    'API Connection': () => testConnection(),
    'Auth Status': () => checkAuthStatus(),
    'Fetch Families': () => familiesAPI.getFamilies(),
    'Create Test Family': () => familiesAPI.createFamily({
      name: 'Test Family ' + Date.now(),
      contact: '9876543210',
      center: user?.role === 'admin' ? 'Delhi Center' : user?.center,
      address: 'Test Address, Test City, Test State 123456'
    })
  };

  const clearResults = () => {
    setDebugResults({});
    console.clear();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🔧 Debug Panel</h2>
        <button
          onClick={clearResults}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(tests).map(([testName, testFunction]) => (
          <button
            key={testName}
            onClick={() => runTest(testName, testFunction)}
            disabled={loading}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '⏳' : '🧪'} {testName}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(debugResults).map(([testName, result]) => (
          <div key={testName} className="border rounded p-4">
            <div className="flex items-center mb-2">
              <span className={`mr-2 ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                {result.success ? '✅' : '❌'}
              </span>
              <h3 className="font-semibold">{testName}</h3>
            </div>
            
            {result.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2">
                <strong>Error:</strong> {result.error}
              </div>
            )}
            
            {result.data && (
              <div className="bg-gray-100 p-3 rounded">
                <pre className="text-sm overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">🔍 Current User Info:</h3>
        <pre className="text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">📝 Debugging Steps:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Check API Connection - Verify backend is running</li>
          <li>Check Auth Status - Ensure token is present and valid</li>
          <li>Fetch Families - Test GET request</li>
          <li>Create Test Family - Test POST request</li>
          <li>Open browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugPanel;
