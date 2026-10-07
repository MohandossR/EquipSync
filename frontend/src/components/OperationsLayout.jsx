import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function OperationsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              EQ
            </div>

            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              EquipSync
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/customer/create"
              className="px-4 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              New Request
            </Link>

            <Link
              to="/customer/requests"
              className="px-4 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              My Requests
            </Link>

            <Link
              to="/technician"
              className="px-4 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Technician
            </Link>
          </div>

          {/* User / Logout */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 font-medium border-r pr-4 border-slate-200">
              Operations Manager
            </div>

            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="py-8 px-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}