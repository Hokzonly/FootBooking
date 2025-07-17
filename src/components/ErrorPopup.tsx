import React, { useEffect } from 'react';
import { X, AlertCircle, Clock, Calendar, Info, CheckCircle } from 'lucide-react';

interface ErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({ 
  isOpen, 
  onClose, 
  error, 
  type = 'error' 
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-red-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className={`relative max-w-md w-full ${getBgColor()} border rounded-2xl shadow-2xl transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <div>
                <h3 className={`text-lg font-semibold ${getTextColor()}`}>
                  {type === 'success' ? 'Success!' : type === 'error' ? 'Booking Error' : type === 'warning' ? 'Warning' : 'Information'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className={`text-sm ${getTextColor()} leading-relaxed`}>
              {error}
            </p>

            {/* Additional info for rate limiting */}
            {error.includes('one game per day') && (
              <div className="bg-white bg-opacity-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Daily limit: 1 booking per phone number</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Reset time: Midnight (00:00)</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white bg-opacity-70 text-gray-700 rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium"
              >
                Got it
              </button>
              {error.includes('one game per day') && (
                <button
                  onClick={() => {
                    onClose();
                    // You could add navigation to booking history here
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium"
                >
                  View My Bookings
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
          <div className="h-full bg-gray-400 transition-all duration-5000 ease-linear animate-pulse" />
        </div>
      </div>
    </div>
  );
}; 