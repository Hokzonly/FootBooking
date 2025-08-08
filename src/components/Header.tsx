import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Menu, X, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get user info from localStorage
  const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  };
  
  const userInfo = getUserInfo();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-green-600 rounded-lg p-1 sm:p-1.5 md:p-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">FootBooking</h1>
              <p className="text-xs text-gray-500 hidden md:block">{t('bookInClicks')}</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base sm:text-lg font-bold text-gray-900">FootBooking</h1>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {!isAdminRoute && (
              <button 
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const academiesSection = document.getElementById('academies-section');
                    academiesSection?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-gray-700 hover:text-green-600 transition-colors flex items-center text-sm xl:text-base"
              >
                <Calendar className="h-4 w-4 xl:h-5 xl:w-5 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">{t('bookings')}</span>
              </button>
            )}
            {!isAdminRoute && (
              <Link 
                to="/tournaments" 
                className="text-gray-700 hover:text-green-600 transition-colors flex items-center text-sm xl:text-base"
              >
                <Trophy className="h-4 w-4 xl:h-5 xl:w-5 mr-1 xl:mr-2" />
                <span className="hidden xl:inline">{t('tournaments')}</span>
              </Link>
            )}
            {isAdminRoute ? (
              <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors text-sm xl:text-base">
                {t('back')} à l'App
              </Link>
            ) : (
              <Link to="/admin/login" className="text-gray-700 hover:text-green-600 transition-colors text-sm xl:text-base">
                <User className="h-4 w-4 xl:h-5 xl:w-5 inline mr-1 xl:mr-2" />
                <span className="hidden xl:inline">{t('admin')}</span>
              </Link>
            )}
            
            {/* Welcome Message */}
            {isLoggedIn && userInfo && (
              <div className="text-sm xl:text-base text-gray-700 flex items-center">
                <User className="h-4 w-4 mr-1 text-green-600" />
                <span className="hidden xl:inline">{t('welcome')}, </span>
                <span className="font-semibold text-green-600">{userInfo.name || userInfo.email}</span>
              </div>
            )}
            
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="px-2 py-1.5 xl:px-3 xl:py-2 rounded bg-green-600 text-white hover:bg-green-700 transition text-xs xl:text-sm">{t('login')}</Link>
                <Link to="/register" className="px-2 py-1.5 xl:px-3 xl:py-2 rounded bg-gray-200 text-green-700 hover:bg-gray-300 transition text-xs xl:text-sm">{t('register')}</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="px-2 py-1.5 xl:px-3 xl:py-2 rounded bg-red-500 text-white hover:bg-red-600 transition text-xs xl:text-sm">{t('logout')}</button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-green-600 transition-colors p-1"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 sm:py-4">
            <div className="flex flex-col space-y-2 sm:space-y-3">
              {/* Welcome Message for Mobile */}
              {isLoggedIn && userInfo && (
                <div className="px-4 py-2 text-gray-700 border-b border-gray-100">
                  <div className="text-sm">
                    <span>{t('welcome')}, </span>
                    <span className="font-semibold text-green-600">{userInfo.name || userInfo.email}</span>
                  </div>
                </div>
              )}
              
              {!isAdminRoute && (
                <button 
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                    setTimeout(() => {
                      const academiesSection = document.getElementById('academies-section');
                      academiesSection?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-gray-700 hover:text-green-600 transition-colors px-4 py-2 flex items-center text-left"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {t('bookings')}
                </button>
              )}
              {!isAdminRoute && (
                <Link 
                  to="/tournaments" 
                  className="text-gray-700 hover:text-green-600 transition-colors px-4 py-2 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  {t('tournaments')}
                </Link>
              )}
              {isAdminRoute ? (
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-green-600 transition-colors px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('back')} à l'App
                </Link>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-gray-700 hover:text-green-600 transition-colors px-4 py-2 flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  {t('admin')}
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