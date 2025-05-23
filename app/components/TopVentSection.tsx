'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const TopVentSection: React.FC = () => {
  const imagesTop1 = ['/products/biege1.jpg', '/products/blue1.jpg', '/products/red1.jpg'];
  const imagesBottom = ['/products/prod21.jpeg', '/products/prod22.jpeg', '/products/prod23.jpeg'];

  const [currentIndexTop, setCurrentIndexTop] = useState(0);
  const [currentIndexBottom, setCurrentIndexBottom] = useState(0);

  // Preload images - FIXED
  useEffect(() => {
    const preloadImages = (images: string[]) => {
      images.forEach((src) => {
        const img = new window.Image(); // Use window.Image instead of Image
        img.src = src;
      });
    };

    preloadImages(imagesTop1);
    preloadImages(imagesBottom);
  }, [imagesTop1, imagesBottom]);

  // Auto-slide functionality for the first carousel (slides up)
  useEffect(() => {
    const intervalTop = setInterval(() => {
      setCurrentIndexTop((prevIndex) => (prevIndex + 1) % imagesTop1.length);
    }, 5000); // Change slide every 3 seconds

    return () => clearInterval(intervalTop); // Cleanup interval on unmount
  }, [imagesTop1.length]);

  // Auto-slide functionality for the second carousel (slides down)
  useEffect(() => {
    const intervalBottom = setInterval(() => {
      setCurrentIndexBottom((prevIndex) => (prevIndex + 1) % imagesBottom.length);
    }, 7000); // Change slide every 4 seconds

    return () => clearInterval(intervalBottom); // Cleanup interval on unmount
  }, [imagesBottom.length]);

  const handleButtonClick = useCallback(() => {
    // Handle button click
  }, []);

  return (
    <section className="container mx-auto p-2 sm:p-4 py-8 sm:py-16 relative rounded-lg overflow-hidden min-h-[500px] sm:min-h-[600px] bg-white">
      {/* Mixed Carousels */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full z-0 flex gap-2 sm:gap-4">
        {/* First Carousel (Slides Up) */}
        <div className="w-1/2 md:w-1/3 h-full overflow-hidden">
          <div
            className="h-full flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndexTop * 100}%)` }}
          >
            {imagesTop1.map((src, index) => (
              <div key={index} className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3]">
                <Image
                  src={src}
                  alt={`Top Ventes Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0}
                  sizes="(max-width: 768px) 33vw, 25vw"
                  quality={75}
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    console.error(`Failed to load image: ${src}`);
                    const target = e.target as HTMLImageElement;
                    // Fallback to a placeholder if image fails to load
                    if (target.src !== '/placeholder-image.jpg') {
                      target.src = '/placeholder-image.jpg';
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Second Carousel (Slides Down) */}
        <div className="w-1/2 md:w-1/3 h-full overflow-hidden">
          <div
            className="h-full flex flex-col transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentIndexBottom * 100}%)` }}
          >
            {imagesBottom.map((src, index) => (
              <div
                key={index}
                className="min-h-full w-full relative aspect-[3/4] md:aspect-[2/3]"
              >
                <Image
                  src={src}
                  alt={`Top Ventes Image ${index + 4}`}
                  fill
                  className="object-cover rounded-lg"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 33vw, 25vw"
                  quality={75}
                  onError={(e) => {
                    console.error(`Failed to load image: ${src}`);
                    const target = e.target as HTMLImageElement;
                    // Fallback to a placeholder if image fails to load
                    if (target.src !== '/placeholder-image.jpg') {
                      target.src = '/placeholder-image.jpg';
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center md:items-start items-center text-center md:text-left p-2 sm:p-4 md:pl-8">
        {/* Mobile version (centered with blur) */}
        <div className="relative w-[80%] md:hidden backdrop-blur-sm bg-white/30 rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
            Découvrez nos Top Ventes
          </h1>
          <p className="text-base sm:text-lg mb-4 text-gray-700 mx-auto">
            Explorez nos produits les plus populaires et profitez des meilleures offres.
          </p>
          <Link href="/collections" passHref className="block">
            <Button
              className="inline-flex items-center justify-center px-6 py-2.5 text-base font-semibold text-white bg-black rounded-full hover:bg-[#B4941F]/90 transition-colors shadow-lg hover:shadow-xl mx-auto w-full"
              onClick={handleButtonClick}
              aria-label="Voir les Top Ventes"
            >
              Voir les Top Ventes
            </Button>
          </Link>
        </div>

        {/* Desktop version (original left-aligned) */}
        <div className="hidden md:block md:w-[50%]">
          <h1 className="text-[40px] font-bold mb-6 text-gray-800">
            Découvrez nos Top Ventes
          </h1>
          <p className="text-xl mb-8 max-w-[80%] text-gray-700">
            Explorez nos produits les plus populaires et profitez des meilleures offres.
          </p>
          <Link href="/collections" passHref>
            <Button
              className="inline-flex items-center justify-center px-8 py-3 text-xl font-semibold text-white bg-black rounded-full hover:bg-[#B4941F]/90 transition-colors shadow-lg hover:shadow-xl"
              onClick={handleButtonClick}
              aria-label="Voir les Top Ventes"
            >
              Voir les Top Ventes
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default React.memo(TopVentSection);