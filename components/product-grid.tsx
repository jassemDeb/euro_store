"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, ProductImage } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ProductWithImages extends Product {
  images: ProductImage[];
}

interface ProductGridProps {
  filters: {
    category: string;
    collaborator: string;
    sort: string;
    product: string;
  };
}

const ProductGrid = ({ filters }: ProductGridProps) => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithImages[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: string }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductWithImages | null>(null);
  const { addItem } = useCart();

  const formatPrice = (price: number) => price.toFixed(2);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();
        if (filters.category && filters.category !== 'Tous') params.append('category', filters.category);
        if (filters.collaborator && filters.collaborator !== 'all') params.append('collaborateur', filters.collaborator);
        if (filters.sort && filters.sort !== 'featured') params.append('sort', filters.sort);
        if (filters.product) params.append('product', filters.product);
        const response = await fetch('/api/products?' + params.toString());
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
        // Set default main image for each product
        const initialSelectedImages: { [key: string]: string } = {};
        data.forEach((product: ProductWithImages) => {
          const mainImage = product.images.find(img => img.isMain)?.url || product.images[0]?.url;
          if (mainImage) initialSelectedImages[product.id] = mainImage;
        });
        setSelectedImage(initialSelectedImages);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filters]);

  const handleAddToCart = (product: ProductWithImages) => {
    setCurrentProduct(product);
    setDialogOpen(true);
  };

  const confirmAddToCart = () => {
    if (!currentProduct) return;
    addItem(currentProduct); // Add with default options
    setDialogOpen(false);
  };

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-md mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative"
            >
              {/* Main Product Image */}
              <div
                className="relative aspect-[2/3] mb-2 overflow-hidden rounded-md bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/product/${product.id}`)}
              >
                {selectedImage[product.id] && (
                  <Image
                    src={selectedImage[product.id]}
                    alt={product.name}
                    fill
                    className="object-cover object-center transition-opacity duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={products.indexOf(product) < 4}
                    loading={products.indexOf(product) < 4 ? "eager" : "lazy"}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallbackImg = product.images[0]?.url || '/placeholder-image.jpg';
                      if (target.src !== fallbackImg) {
                        target.src = fallbackImg;
                      }
                    }}
                    quality={75}
                  />
                )}
                {/* Promo Badge */}
                {product.salePrice && (
                  <div className="absolute top-2 left-2 bg-[#B4941F] text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                    Promo
                  </div>
                )}
                {/* Quick Add Overlay */}
                <div className={cn(
                  "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300",
                  // Show overlay on hover (if you want hover effect, you can add state logic)
                )}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="bg-[#B4941F] text-white hover:bg-black hover:text-[#B4941F]"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 " />
                    Ajout Rapide
                  </Button>
                </div>
              </div>
              {/* Product Info */}
              <div className="text-gray-700">
                <h3 className="text-sm font-semibold">{product.name}</h3>
                <div className="mt-1">
                  {product.salePrice ? (
                    <p className="text-xs text-gray-500 line-through">{formatPrice(product.price)} TND</p>
                  ) : (
                    <p className="text-xs text-[#B4941F]">{formatPrice(product.price)} TND</p>
                  )}
                  {product.salePrice && (
                    <p className="text-xs text-[#B4941F] font-semibold"><span className="text-[#B4941F] mr-1">Promo :</span> {formatPrice(product.salePrice)} TND</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Dialog for Add to Cart (simplified for schema) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Produit ajouté au panier</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Product Image */}
            {currentProduct && selectedImage[currentProduct.id] && (
              <div className="relative aspect-square rounded-md overflow-hidden">
                <Image
                  src={selectedImage[currentProduct.id]}
                  alt={currentProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority={true}
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallbackImg = currentProduct.images[0]?.url || '/placeholder-image.jpg';
                    if (target.src !== fallbackImg) {
                      target.src = fallbackImg;
                    }
                  }}
                  quality={75}
                />
              </div>
            )}
            {/* Product Info */}
            <div className="flex flex-col justify-between">
              {currentProduct && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg">{currentProduct.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{currentProduct.description.split('\n')[0]}</p>
                    {/* Price */}
                    <div className="mt-2">
                      {currentProduct.salePrice ? (
                        <>
                          <p className="text-xs text-gray-500 line-through">{formatPrice(currentProduct.price)} TND</p>
                          <p className="text-sm text-[#B4941F] font-semibold">
                            <span className="text-[#B4941F] mr-1">Promo :</span> {formatPrice(currentProduct.salePrice)} TND
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-[#B4941F]">{formatPrice(currentProduct.price)} TND</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={confirmAddToCart} className="w-full mt-4 bg-[#B4941F] text-white hover:bg-black hover:text-[#B4941F]">
                      Confirmer
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGrid;