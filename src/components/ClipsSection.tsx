import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Heart, MessageCircle } from 'lucide-react';
import styled from 'styled-components';
import CustomToggle from './CustomToggle';

interface Clip {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  playerName: string;
  academyName: string;
  likes: number;
  comments: number;
  views: number;
  date: string;
  isFeatured: boolean;
}

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
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [isMonthSelected, setIsMonthSelected] = useState(false);
  const [featuredClip, setFeaturedClip] = useState({
    id: 1,
    title: "Amazing Goal from Outside the Box",
    playerName: "@Ahmed_Benz",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    views: 1247,
    likes: 89,
    comments: 23,
    uploadedAt: "2025-07-20"
  });

  const weeklyClips: Clip[] = useMemo(() => [
    {
      id: '1',
      title: 'Amazing Goal from Outside the Box',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnailUrl: 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
      playerName: 'Ahmed_Benz',
      academyName: 'FootAcademy Marrakech',
      likes: 156,
      comments: 23,
      views: 1247,
      date: '2024-01-15',
      isFeatured: true
    },
    {
      id: '2',
      title: 'Perfect Team Play - 3 Passes Goal',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnailUrl: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
      playerName: 'Youssef_Pro',
      academyName: 'Kickoff Academy',
      likes: 89,
      comments: 12,
      views: 892,
      date: '2024-01-14',
      isFeatured: false
    }
  ], []);

  const monthlyClips: Clip[] = useMemo(() => [
    {
      id: '3',
      title: 'Best Goal of January 2024',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnailUrl: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
      playerName: 'Karim_Star',
      academyName: 'Masterfoot Academy',
      likes: 342,
      comments: 45,
      views: 2156,
      date: '2024-01-10',
      isFeatured: true
    }
  ], []);

  const currentClips = useMemo(() => 
    activeTab === 'week' ? weeklyClips : monthlyClips, 
    [activeTab, weeklyClips, monthlyClips]
  );
  
  useEffect(() => {
    const newFeaturedClip = currentClips.find(clip => clip.isFeatured) || currentClips[0];
    if (newFeaturedClip) {
      setFeaturedClip({
        id: parseInt(newFeaturedClip.id),
        title: newFeaturedClip.title,
        playerName: `@${newFeaturedClip.playerName}`,
        videoUrl: newFeaturedClip.videoUrl,
        views: newFeaturedClip.views,
        likes: newFeaturedClip.likes,
        comments: newFeaturedClip.comments,
        uploadedAt: newFeaturedClip.date
      });
    }
  }, [currentClips]);

  const handleToggleChange = (checked: boolean) => {
    setIsMonthSelected(checked);
    setActiveTab(checked ? 'month' : 'week');
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <CustomToggle 
            isChecked={isMonthSelected}
            onChange={handleToggleChange}
          />
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
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
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