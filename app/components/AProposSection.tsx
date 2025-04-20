'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function AProposSection() {
  const images = [
    '/carousel/car1.jpg',
    '/carousel/car2.jpg',
    '/carousel/car3.jpg',
    '/carousel/car4.jpg',
    '/carousel/car5.jpg',
    '/carousel/car6.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [images.length]);

  // Handle manual navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <section className="gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="relative">
            {/* Custom Carousel */}
            <div className="overflow-hidden rounded-lg bg-black/5 backdrop-blur-sm">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((src, index) => (
                  <div
                    key={index}
                    className="relative min-w-full flex-shrink-0 transition-opacity duration-200"
                    style={{ opacity: currentIndex === index ? 1 : 0.6 }}
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-lg">
                      <div className="relative h-full w-full">
                        <Image
                          src={src}
                          alt={`A Propos Image ${index + 1}`}
                          fill
                          className="object-cover object-center transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0} // Only prioritize the first image
                          loading={index === 0 ? 'eager' : 'lazy'} // Lazy load non-visible images
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="mt-4 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 
                            ${currentIndex === index 
                              ? 'bg-black w-6' 
                              : 'bg-black/20 w-2 hover:bg-black/40'}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-bold">À Propos de Euro Store TN</h2>
            <p className="mb-6 text-lg text-gray-600">
              Euro Store TN est votre destination incontournable pour équiper votre maison avec des produits de qualité. Spécialisés dans la vente en ligne, 
              nous vous proposons une large gamme d&apos;électroménagers et d&apos;accessoires pratiques, 
              allant des cafetières aux aspirateurs, en passant par des marques reconnues comme Ninja.
            </p>
            <p className="mb-8 text-lg text-gray-600">
            Nous sélectionnons avec soin des articles alliant performance, design et fiabilité, afin de vous offrir une expérience d&apos;achat simple, rapide et satisfaisante. 
            Que vous souhaitiez améliorer votre quotidien ou faire plaisir à vos proches, Euro Store TN est là pour répondre à tous vos besoins domestiques.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-white p-4 shadow transition-transform duration-300 hover:scale-105">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Livraison rapide</h3>
                <p className="text-gray-600">Partout en Tunisie</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow transition-transform duration-300 hover:scale-105">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Produits de qualité</h3>
                <p className="text-gray-600">Marques reconnues</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow transition-transform duration-300 hover:scale-105">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Service client</h3>
                <p className="text-gray-600">24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}