import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  autoSlide?: boolean;
  slideInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  autoSlide = false, 
  slideInterval = 3000,
  showNavigation = true,
  showDots = true,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;

    const interval = setInterval(() => {
      nextImage();
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, images.length]);

  if (images.length === 0) {
    return (
      <div className={`relative h-96 bg-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No images available
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={e => {
            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image';
          }}
        />
        
        {/* Text overlay for academy name */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-2">Football Academy</h2>
            <p className="text-xl opacity-90">Acotball Academy</p>
          </div>
        </div>
        
        {images.length > 1 && showNavigation && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      
      {images.length > 1 && showDots && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-green-600' : 'bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};