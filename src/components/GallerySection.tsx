import React from 'react';
import { CardCarousel } from './CardCarousel';

interface GallerySectionProps {
  images: string[];
  title?: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ 
  images, 
  title = "Gallery"
}) => {
  // Convert string array to the format expected by CardCarousel
  const carouselImages = images.map((image, index) => ({
    src: image,
    alt: `Gallery image ${index + 1}`
  }));

  if (carouselImages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          No gallery images available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <CardCarousel 
        images={carouselImages}
        title={title}
        subtitle="Explore our facilities and activities"
        autoplayDelay={3000}
        showPagination={true}
        showNavigation={true}
      />
    </div>
  );
}; 