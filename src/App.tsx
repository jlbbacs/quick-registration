import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EditRegistrant } from './components/EditRegistrant';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<RegistrationForm />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/edit/:id"
              element={
                <ProtectedRoute>
                  <EditRegistrant />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;