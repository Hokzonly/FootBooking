import React from 'react';
import { Search, MapPin, Calendar, Clock, Grid, Map } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    search: string;
    fieldType: string;
    location: string;
    date: string;
    time: string;
  };
  onFiltersChange: (filters: any) => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (mode: 'grid' | 'map') => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search academies..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm md:text-base"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm md:text-base"
          />
        </div>

        <select
          value={filters.fieldType}
          onChange={(e) => onFiltersChange({ ...filters, fieldType: e.target.value })}
          className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm md:text-base"
        >
          <option value="">All Field Types</option>
          <option value="5v5 Field">5v5 Field</option>
          <option value="7v7 Field">7v7 Field</option>
          <option value="11v11 Field">11v11 Field</option>
        </select>

        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onFiltersChange({ ...filters, date: e.target.value })}
            className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm md:text-base"
          />
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="time"
            value={filters.time}
            onChange={(e) => onFiltersChange({ ...filters, time: e.target.value })}
            className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm md:text-base"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <button
          onClick={() => onFiltersChange({ search: '', fieldType: '', location: '', date: '', time: '' })}
          className="text-gray-600 hover:text-gray-800 transition-colors text-xs sm:text-sm md:text-base"
        >
          Clear Filters
        </button>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="text-xs sm:text-sm text-gray-600">View:</span>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1 sm:p-1.5 md:p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Grid className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`p-1 sm:p-1.5 md:p-2 rounded-md transition-colors ${
              viewMode === 'map' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Map className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};