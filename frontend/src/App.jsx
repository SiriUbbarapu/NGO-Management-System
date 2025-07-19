import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import Students from './pages/Students';
import Women from './pages/Women';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/families" element={
              <ProtectedRoute>
                <Layout>
                  <Families />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/students" element={
              <ProtectedRoute>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/women" element={
              <ProtectedRoute>
                <Layout>
                  <Women />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
