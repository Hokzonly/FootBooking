import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Users } from 'lucide-react';
import { Academy } from '../types';

interface AcademyGridProps {
  academies: Academy[];
}

export const AcademyGrid: React.FC<AcademyGridProps> = ({ academies }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {academies.map((academy) => (
        <div key={academy.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img
              src={academy.image ? academy.image : (academy.images && academy.images[0] ? academy.images[0] : 'https://placehold.co/400x200?text=No+Image')}
              alt={academy.name}
              className="w-full h-40 sm:h-48 object-cover"
            />
            <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                <span className="text-xs sm:text-sm font-medium">{academy.rating}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{academy.name}</h3>
            
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="text-xs sm:text-sm line-clamp-1">{academy.location}</span>
            </div>
            
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center text-gray-600">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{academy.fields ? academy.fields.length : 0} fields</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm hidden sm:inline">{academy.phone}</span>
                <span className="text-xs sm:hidden">📞</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{academy.description}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-600">
                {academy.fields && academy.fields.length > 0
                  ? `From ${Math.min(...academy.fields.map(f => f.pricePerHour))} MAD/hour`
                  : 'No fields available'}
              </div>
              <Link
                to={`/academy/${academy.id}`}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};