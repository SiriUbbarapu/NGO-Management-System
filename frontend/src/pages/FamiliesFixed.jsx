import React, { useState, useEffect } from 'react';
import { familiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FamiliesFixed = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFamily, setNewFamily] = useState({
    name: '',
    contact: '',
    center: '',
    address: ''
  });
  const { user } = useAuth();

  // Fixed useEffect - proper error handling and response structure
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching families...');
        const response = await familiesAPI.getFamilies();
        console.log('Families response:', response);
        
        // Since the API interceptor returns response.data, 
        // the response structure is: { success: true, data: { families: [...] } }
        if (response.success) {
          setFamilies(response.data.families || []);
        } else {
          throw new Error(response.message || 'Failed to fetch families');
        }
      } catch (error) {
        console.error('Error fetching families:', error);
        setError(error.message);
        // Don't fall back to mock data in production
        setFamilies([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilies();
  }, []);

  // Fixed handleAddFamily - proper error handling and validation
  const handleAddFamily = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate required fields
      if (!newFamily.name || !newFamily.contact || !newFamily.center || !newFamily.address) {
        throw new Error('All fields are required');
      }

      // Validate contact number (10 digits)
      if (!/^\d{10}$/.test(newFamily.contact)) {
        throw new Error('Contact must be a 10-digit number');
      }

      // For tutors, ensure they're creating family for their center
      if (user.role === 'tutor' && newFamily.center !== user.center) {
        throw new Error('You can only create families for your assigned center');
      }

      console.log('Creating family:', newFamily);
      console.log('User context:', user);
      
      const response = await familiesAPI.createFamily(newFamily);
      console.log('Create family response:', response);
      
      if (response.success) {
        // Add the new family to the current list
        setFamilies(prevFamilies => [response.data.family, ...prevFamilies]);
        
        // Reset form and close modal
        setNewFamily({ name: '', contact: '', center: '', address: '' });
        setIsAddModalOpen(false);
        
        console.log('Family created successfully');
      } else {
        throw new Error(response.message || 'Failed to create family');
      }
    } catch (error) {
      console.error('Error creating family:', error);
      setError(error.message);
    }
  };

  // Debug function to check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('User:', user ? JSON.parse(user) : 'Missing');
  };

  // Test API connection
  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      console.log('API Health Check:', data);
    } catch (error) {
      console.error('API Connection Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading families...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Families Management</h1>
        <div className="space-x-2">
          <button
            onClick={checkAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Auth
          </button>
          <button
            onClick={testAPI}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test API
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Add Family
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Families List */}
      <div className="grid gap-4">
        {families.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No families found. Try adding a new family.
          </div>
        ) : (
          families.map((family) => (
            <div key={family._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{family.name}</h3>
                  <p className="text-gray-600">Contact: {family.contact}</p>
                  <p className="text-gray-600">Center: {family.center}</p>
                  <p className="text-gray-600">Address: {family.address}</p>
                  <p className="text-sm text-gray-500">
                    Members: {family.totalMembers || 0}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(family.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Family Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Family</h2>
            
            <form onSubmit={handleAddFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Family Name *</label>
                <input
                  type="text"
                  value={newFamily.name}
                  onChange={(e) => setNewFamily({...newFamily, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter family name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Number *</label>
                <input
                  type="tel"
                  value={newFamily.contact}
                  onChange={(e) => setNewFamily({...newFamily, contact: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="10-digit contact number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Center *</label>
                <select
                  value={newFamily.center}
                  onChange={(e) => setNewFamily({...newFamily, center: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Center</option>
                  {user.role === 'admin' ? (
                    <>
                      <option value="Delhi Center">Delhi Center</option>
                      <option value="Mumbai Center">Mumbai Center</option>
                      <option value="Bangalore Center">Bangalore Center</option>
                    </>
                  ) : (
                    <option value={user.center}>{user.center}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <textarea
                  value={newFamily.address}
                  onChange={(e) => setNewFamily({...newFamily, address: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter complete address"
                  rows="3"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
                >
                  Create Family
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewFamily({ name: '', contact: '', center: '', address: '' });
                    setError(null);
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamiliesFixed;
