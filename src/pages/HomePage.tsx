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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] mb-8 sm:mb-12 lg:mb-16 bg-gradient-to-br from-green-100 via-white to-green-50 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-center mb-3 sm:mb-4 px-4 drop-shadow-lg"
        >
          <div className="text-green-600 mb-4">
            <MorphingText 
              texts={["FootBooking", "Réservation", "Communauté", "Football"]}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold"
            />
          </div>
          <div className="text-gray-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            — Votre plateforme complète de réservation et communauté football
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 text-center mb-6 sm:mb-8 max-w-4xl px-4"
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
          className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:bg-green-700 transition-colors"
          onClick={() => academiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t('bookField')}
        </motion.button>
        {/* Decorative animated circles */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
          className="absolute -top-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-green-200 rounded-full opacity-30 z-0"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8, type: 'spring' }}
          className="absolute -bottom-12 -right-12 w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 bg-green-300 rounded-full opacity-20 z-0"
        />
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-16 sm:mb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('featuresTitle')}</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
        className="mb-16 sm:mb-20 bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 sm:p-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('whyChooseUsTitle')}</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Clips Section */}
      <ClipsSection />

      {/* Submit Play Section */}
      <SubmitPlaySection />

      <div className="mb-6 sm:mb-8" ref={academiesRef}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('findFields')}</h1>
        <p className="text-base sm:text-lg text-gray-600">{t('bookInClicks')}</p>
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
    </div>
  );
};