"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductImage, Stock } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileProductCardProps = {
  product: Product & {
    images: ProductImage[];
  };
};

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  // Get the main image from the product images
  const mainImage = product.images.find(img => img.isMain);
  const firstImage = product.images[0];
  const imageUrl = mainImage?.url || firstImage?.url || "/placeholder.png";

  const formatPrice = (price: number) => {
    return price.toFixed(2) + " TND";
  };
  return (
    <div className="flex flex-col w-full">
      {/* Image and Promo Tag */}
      <div 
        className="relative aspect-[3/4] mb-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/product/${product.id}`}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 50vw"
            priority={false}
          />
          {product.salePrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
              Promo
            </div>
          )}
        </Link>
      </div>
      {/* Product Info */}
      <div className="flex flex-col gap-1">
        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
        </Link>
        {/* Price */}
        <div className="flex flex-col">
          {product.salePrice ? (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm font-semibold text-red-500">
                Promo: {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
