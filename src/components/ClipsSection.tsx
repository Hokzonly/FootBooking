import React from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Heart, MessageCircle } from 'lucide-react';
import styled from 'styled-components';



interface ClipsSectionProps {
  className?: string;
}

const PhoneFrame = styled.div`
  position: relative;
  width: 280px;
  height: 560px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 30px;
  padding: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: #333;
    border-radius: 2px;
  }
  
  .screen {
    width: 100%;
    height: 100%;
    border-radius: 22px;
    overflow: hidden;
    position: relative;
    background: #000;
  }
`;

export const ClipsSection: React.FC<ClipsSectionProps> = ({ className = "" }) => {
  const featuredClip = {
    id: 1,
    title: "Amazing Football Skills - Hokzi",
    playerName: "@Hokzi",
    videoUrl: "https://www.youtube.com/watch?v=q4N5hot7a60&ab_channel=Hokzi",
    views: 1247,
    likes: 89,
    comments: 23,
    uploadedAt: "2025-07-20"
  };

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${videoIdMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1`;
    }
    
    return url;
  };

  return (
    <section className={`py-12 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🔥 Top Game Moments This Week
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch the best football clips from our community. Submit your own moments and get featured!
          </p>
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          {featuredClip && (
            <div className="flex flex-col items-center">
              <PhoneFrame>
                <div className="screen">
                  {featuredClip.videoUrl.includes('youtube.com') ? (
                    <iframe
                      className="w-full h-full"
                      src={getYouTubeEmbedUrl(featuredClip.videoUrl)}
                      title={featuredClip.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                      src={featuredClip.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {!featuredClip.videoUrl.includes('youtube.com') && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-80" />
                    </div>
                  )}
                </div>
              </PhoneFrame>

              <div className="mt-6 text-center max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {featuredClip.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  Submitted by <span className="font-semibold">{featuredClip.playerName}</span>
                </p>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {featuredClip.views.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {featuredClip.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {featuredClip.comments || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}; 