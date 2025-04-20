"use client"

import { useState, useEffect } from "react"
import { Product, ProductImage } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductCardProps {
  product: Product & {
    images: ProductImage[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Get current color variant and its images
  const images = product.images || []
  const currentImage = images[currentImageIndex]?.url || '/default-image.jpg'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
      {...(!isMobile && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => {
          setIsHovered(false)
          setCurrentImageIndex(0)
        }
      })}
    >
      <Link href={`/product/${product.id}`}>
        {/* Main Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={currentImage}
            alt={`${product.name}`}
            fill
            className="object-cover transform transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            loading="eager"
            quality={75}
            onError={(e) => {
              console.error(`Failed to load image: ${currentImage}`);
              const target = e.target as HTMLImageElement;
              // Fallback to a placeholder if image fails to load
              if (target.src !== '/placeholder-image.jpg') {
                target.src = '/placeholder-image.jpg';
              }
            }}
          />

          {/* Mobile Navigation */}
          {isMobile && images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
              <div className="absolute bottom-2 right-1 -translate-x-1/2 bg-black/50 rounded-full px-2 py-1 z-10">
                <p className="text-xs text-white">
                  {currentImageIndex + 1} / {images.length}
                </p>
              </div>
            </>
          )}

          {/* Product Images */}
          {images.length > 1 && (
            <>
              {/* Desktop - Right Side Vertical */}
              {!isMobile && isHovered && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`relative w-16 h-20 overflow-hidden rounded-md transition-all duration-200 ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-black ring-offset-2 scale-110' 
                        : 'ring-1 ring-white/50 hover:ring-[#B4941F] hover:scale-105'
                    }`}
                    onMouseEnter={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image.url || '/placeholder-image.jpg'}
                      alt={`${product.name}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      quality={75}
                      onError={(e) => {
                        console.error(`Failed to load image: ${image.url}`);
                        const target = e.target as HTMLImageElement;
                        // Fallback to a placeholder if image fails to load
                        if (target.src !== '/placeholder-image.jpg') {
                          target.src = '/placeholder-image.jpg';
                        }
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1">
                      <p className="text-xs text-white text-center capitalize">
                        {product.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              )}

              {/* Mobile - Horizontal Scroll */}
              {isMobile && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm p-2">
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentImageIndex(index)
                        }}
                        className={`relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ${
                          currentImageIndex === index 
                            ? 'ring-2 ring-black ring-offset-2' 
                            : 'ring-1 ring-white/50'
                        }`}
                      >
                        <Image
                          src={image.url || '/placeholder-image.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          quality={75}
                          onError={(e) => {
                            console.error(`Failed to load mobile variant image: ${image.url}`);
                            const target = e.target as HTMLImageElement;
                            // Fallback to a placeholder if image fails to load
                            if (target.src !== '/placeholder-image.jpg') {
                              target.src = '/placeholder-image.jpg';
                            }
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sale Badge */}
          {product.salePrice && (
            <div className="absolute top-2 right-2 bg-[#B4941F] text-white px-2 py-1 rounded-md text-sm font-medium z-10">
              -{Math.round((1 - product.salePrice / product.price) * 100)}%
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
            {product.description.split('\n')[0]}
          </p>

          {/* Price */}
          <div className="mt-3 flex items-baseline space-x-2">
            {product.salePrice ? (
              <>
                <span className="text-xl font-bold text-[#B4941F]">
                  {product.salePrice.toFixed(2)} TND
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toFixed(2)} TND
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-[#B4941F]">
                {product.price.toFixed(2)} TND
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}