import React, { useState, useEffect, useRef } from 'react';
import { SearchFilters } from '../components/SearchFilters';
import { AcademyGrid } from '../components/AcademyGrid';
import { MapView } from '../components/MapView';
import { Academy } from '../types';
import { motion } from 'framer-motion';
import { API_URL } from '../config/api';
import { Calendar, MapPin, Users, Star, Trophy, Camera, Heart, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MorphingText } from '../components/magicui/morphing-text';
import { ClipsSection } from '../components/ClipsSection';
import { SubmitPlaySection } from '../components/SubmitPlaySection';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [filteredAcademies, setFilteredAcademies] = useState<Academy[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    fieldType: '',
    location: '',
    date: '',
    time: ''
  });
  const academiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch academies from backend
          fetch(`${API_URL}/academies`)
      .then(res => res.json())
      .then(data => {
        setAcademies(data);
        setFilteredAcademies(data);
      });
  }, []);

  useEffect(() => {
    let filtered = academies;

    if (filters.search) {
      filtered = filtered.filter(academy => 
        academy.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        academy.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.fieldType) {
      filtered = filtered.filter(academy => 
        academy.fields.some(field => field.type === filters.fieldType)
      );
    }

    if (filters.location) {
      filtered = filtered.filter(academy => 
        academy.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredAcademies(filtered);
  }, [filters, academies]);

  const features = [
    {
      icon: Calendar,
      title: t('bookFieldsTitle'),
      description: t('bookFieldsDesc')
    },
    {
      icon: MapPin,
      title: t('exploreProfilesTitle'),
      description: t('exploreProfilesDesc')
    },
    {
      icon: Users,
      title: t('stayUpdatedTitle'),
      description: t('stayUpdatedDesc')
    },
    {
      icon: Camera,
      title: t('showcaseSkillsTitle'),
      description: t('showcaseSkillsDesc')
    },
    {
      icon: Heart,
      title: t('engageCommunityTitle'),
      description: t('engageCommunityDesc')
    },
    {
      icon: Trophy,
      title: t('earnRewardsTitle'),
      description: t('earnRewardsDesc')
    }
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: t('connectTitle'),
      description: t('connectDesc')
    },
    {
      icon: Star,
      title: t('easyUseTitle'),
      description: t('easyUseDesc')
    },
    {
      icon: Heart,
      title: t('communityTitle'),
      description: t('communityDesc')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] mb-6 sm:mb-8 md:mb-12 lg:mb-16 bg-gradient-to-br from-green-100 via-white to-green-50 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-center mb-2 sm:mb-3 md:mb-4 px-3 sm:px-4 drop-shadow-lg"
        >
          <div className="text-green-600 mb-2 sm:mb-3 md:mb-4">
            <MorphingText 
              texts={["FootBooking", "Réservation", "Communauté", "Football"]}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold"
            />
          </div>
          <div className="text-gray-900 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold px-2 sm:px-4">
            — Votre plateforme complète de réservation et communauté football
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 text-center mb-4 sm:mb-6 md:mb-8 max-w-3xl sm:max-w-4xl px-3 sm:px-4"
        >
          {t('heroSubtitle')}
        </motion.p>
        <motion.button
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ 
            scale: 1.08,
            y: -5
          }}
          whileTap={{ scale: 0.97 }}
          className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-green-600 text-white text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-lg hover:bg-green-700 transition-colors"
          onClick={() => academiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t('bookField')}
        </motion.button>
        {/* Decorative animated circles */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
          className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-green-200 rounded-full opacity-30 z-0"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8, type: 'spring' }}
          className="absolute -bottom-6 -right-6 sm:-bottom-12 sm:-right-12 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-56 lg:h-56 bg-green-300 rounded-full opacity-20 z-0"
        />
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-12 sm:mb-16 md:mb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t('featuresTitle')}</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-12 sm:mb-16 md:mb-20 bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t('whyChooseUsTitle')}</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {whyChooseUs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{item.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Clips Section */}
      <ClipsSection />

      {/* Submit Play Section */}
      <SubmitPlaySection />

      <div className="mb-4 sm:mb-6 md:mb-8" ref={academiesRef} id="academies-section">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2">{t('findFields')}</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">{t('bookInClicks')}</p>
      </div>

      <SearchFilters 
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="mt-6 sm:mt-8">
        {viewMode === 'grid' ? (
          <AcademyGrid academies={filteredAcademies} />
        ) : (
          <MapView academies={filteredAcademies} />
        )}
      </div>

      {/* Social Media Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-12 sm:mt-16 md:mt-20 bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Suivez-nous</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Restez connecté avec notre communauté football</p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-8 lg:space-x-12">
          <motion.a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">Instagram</span>
            <span className="text-xs sm:text-sm text-gray-600">@footbooking</span>
          </motion.a>

          <motion.a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">TikTok</span>
            <span className="text-xs sm:text-sm text-gray-600">@footbooking</span>
          </motion.a>

          <motion.a
            href="https://www.youtube.com/@Hokzi05"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">YouTube</span>
            <span className="text-xs sm:text-sm text-gray-600">FootBooking</span>
          </motion.a>
        </div>
      </motion.section>
    </div>
  );
};