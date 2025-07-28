import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, Clock, CheckCircle, XCircle, Eye, Lock, X } from 'lucide-react';
import { API_URL } from '../config/api';

interface SubmitPlaySectionProps {
  className?: string;
}

export const SubmitPlaySection: React.FC<SubmitPlaySectionProps> = ({ className = "" }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(10);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clipTitle, setClipTitle] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isWatchingAd && adTimeLeft > 0) {
      timer = setTimeout(() => {
        setAdTimeLeft((prev) => {
          if (prev <= 1) {
            setIsWatchingAd(false);
            setShowAdModal(false);
            setShowUploadModal(true);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isWatchingAd, adTimeLeft]);

  const handleSubmitClick = () => {
    if (!isLoggedIn) {
      return;
    }
    
    if (showAdModal) {
      setIsWatchingAd(true);
    } else {
      setShowAdModal(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setClipTitle(formatFileName(file));
      setUploadError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !clipTitle.trim()) {
      setUploadError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const userEmail = localStorage.getItem('userEmail') || 'unknown';

      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', clipTitle);
      formData.append('playerName', userEmail);
      formData.append('date', new Date().toISOString().split('T')[0]);
      formData.append('filename', formatFileName(selectedFile));

      const response = await fetch(`${API_URL}/api/submit-play`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setUploadSuccess(true);
        setSelectedFile(null);
        setClipTitle('');
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadSuccess(false);
        }, 3000);
      } else {
        const error = await response.json();
        setUploadError(error.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileName = (file: File) => {
    const userEmail = localStorage.getItem('userEmail') || 'unknown';
    const date = new Date().toISOString().split('T')[0];
    const extension = file.name.split('.').pop();
    return `${userEmail}-${date}.${extension}`;
  };

  return (
    <section className={`py-12 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎬 Submit Your Play
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Share your best football moments with the community!
          </p>

          {!isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Login Required
              </h3>
              <p className="text-yellow-700 mb-4">
                Log in to submit your best play!
              </p>
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Go to Login
              </a>
            </motion.div>
          ) : (
            <button
              onClick={handleSubmitClick}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🎬 Submit Your Play
            </button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full relative"
            >
              <button
                onClick={() => {
                  setShowAdModal(false);
                  setIsWatchingAd(false);
                  setAdTimeLeft(10);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎥 Watch Ad to Unlock
                </h3>
                
                {isWatchingAd ? (
                  <div className="space-y-6">
                    <div className="bg-gray-100 rounded-lg p-6">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {adTimeLeft}s
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${((10 - adTimeLeft) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Please watch the full advertisement to unlock submission.
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Ad in progress...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <p className="text-gray-700 mb-4">
                        To submit your clip, please watch a 10-second advertisement. 
                        This helps us keep the platform free for everyone.
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>10 seconds required</span>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setShowAdModal(false);
                          setIsWatchingAd(false);
                          setAdTimeLeft(10);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitClick}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Start Watching
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full relative"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎬 Upload Your Play
                </h3>
                
                {uploadSuccess ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h4 className="text-xl font-semibold text-green-800">
                      Upload Successful!
                    </h4>
                    <p className="text-green-600">
                      Your play has been submitted and is under review.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Title
                      </label>
                      <input
                        type="text"
                        value={clipTitle}
                        onChange={(e) => setClipTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter a title for your play"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Video File
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum file size: 50MB
                      </p>
                    </div>
                    
                    {uploadError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          <span className="text-red-800">{uploadError}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {uploading ? (
                          <div className="flex items-center justify-center">
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Play
                          </div>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}; 