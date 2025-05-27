import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <UserCircle className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Bax Registration App</span>
              </Link>
            </div>
            <nav className="flex space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/admin/dashboard" 
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} RegistrationApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};