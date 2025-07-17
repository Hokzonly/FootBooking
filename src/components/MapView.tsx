import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Star, Phone, Users } from 'lucide-react';
import { Academy } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  academies: Academy[];
}

export const MapView: React.FC<MapViewProps> = ({ academies }) => {
  const mapRef = useRef<L.Map>(null);

  // Center on Marrakech
  const marrakechCenter: [number, number] = [31.6295, -8.0076];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Football Academies in Marrakech</h2>
        <p className="text-gray-600">Click on markers to view academy details</p>
      </div>
      
      {/* Interactive Map */}
      <div className="h-96">
        <MapContainer
          center={marrakechCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Only render markers for academies with valid coordinates */}
          {academies.filter(a => a.coordinates && a.coordinates.lat && a.coordinates.lng).map((academy) => (
            <Marker
              key={academy.id}
              position={[academy.coordinates.lat, academy.coordinates.lng]}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[250px]">
                  <img
                    src={
                      academy.fields && academy.fields.length > 0 && academy.fields[0].image
                        ? academy.fields[0].image
                        : 'https://placehold.co/400x200?text=No+Image'
                    }
                    alt={academy.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 mb-2">{academy.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{academy.location}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{academy.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{academy.fields.length} fields</span>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{academy.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      From {Math.min(...academy.fields.map(f => f.pricePerHour))} MAD/hour
                    </span>
                    <Link
                      to={`/academy/${academy.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* List of academies below map */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Academies</h3>
        <div className="space-y-4">
          {academies.map((academy) => (
            <div key={academy.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <img
                src={
                  academy.fields && academy.fields.length > 0 && academy.fields[0].image
                    ? academy.fields[0].image
                    : 'https://placehold.co/400x200?text=No+Image'
                }
                alt={academy.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{academy.name}</h4>
                <p className="text-gray-600 text-sm">{academy.location}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-gray-600">{academy.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{academy.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{academy.fields.length} fields</p>
                <p className="text-sm font-medium text-gray-900">From {Math.min(...academy.fields.map(f => f.pricePerHour))} MAD/hour</p>
                <Link
                  to={`/academy/${academy.id}`}
                  className="inline-block mt-2 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};