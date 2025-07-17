import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-green-600 rounded-lg p-1.5 sm:p-2">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">FootBooking</h1>
              <p className="text-xs text-gray-500">Book your next game in 3 clicks</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">FootBooking</h1>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAdminRoute ? (
              <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
                Back to App
              </Link>
            ) : (
              <Link to="/admin/login" className="text-gray-700 hover:text-green-600 transition-colors">
                <User className="h-5 w-5 inline mr-2" />
                Admin
              </Link>
            )}
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="px-3 py-2 sm:px-4 sm:py-2 rounded bg-green-600 text-white hover:bg-green-700 transition text-sm sm:text-base">Login</Link>
                <Link to="/register" className="px-3 py-2 sm:px-4 sm:py-2 rounded bg-gray-200 text-green-700 hover:bg-gray-300 transition text-sm sm:text-base">Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="px-3 py-2 sm:px-4 sm:py-2 rounded bg-red-500 text-white hover:bg-red-600 transition text-sm sm:text-base">Logout</button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              {isAdminRoute ? (
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-green-600 transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Back to App
                </Link>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-gray-700 hover:text-green-600 transition-colors px-4 py-2 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Admin
                </Link>
              )}
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 rounded bg-gray-200 text-green-700 hover:bg-gray-300 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition text-left"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};