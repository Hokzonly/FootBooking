import React, { useState, useEffect, useRef } from 'react';
import { SearchFilters } from '../components/SearchFilters';
import { AcademyGrid } from '../components/AcademyGrid';
import { MapView } from '../components/MapView';
import { Academy } from '../types';
import { motion } from 'framer-motion';
import { API_URL } from '../config/api';

export const HomePage: React.FC = () => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] mb-8 sm:mb-12 lg:mb-16 bg-gradient-to-br from-green-100 via-white to-green-50 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 text-center mb-3 sm:mb-4 px-4 drop-shadow-lg"
        >
          Book Your Next <span className="text-green-600">Football Game</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 text-center mb-6 sm:mb-8 max-w-2xl px-4"
        >
          Discover and reserve the best football fields in your city. Fast, easy, and reliable.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.97 }}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:bg-green-700 transition-colors"
          onClick={() => academiesRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          Book a Field
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

      <div className="mb-6 sm:mb-8" ref={academiesRef}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Find Football Fields Near You</h1>
        <p className="text-base sm:text-lg text-gray-600">Book your next game in 3 clicks</p>
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