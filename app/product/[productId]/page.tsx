"use client";

import { useEffect, useState } from "react";
import { Product, ProductImage } from "@prisma/client";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import ProductGrid from "@/components/product-grid";
import { DirectPurchaseForm } from "@/components/direct-purchase-form";
import { toast } from "sonner";

interface ProductWithImages extends Product {
  images: ProductImage[];
}

export default function ProductPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<{ fullName: string; address: string; governorate: string; phone: string }>({
    fullName: "",
    address: "",
    governorate: "",
    phone: "",
  });
  const { addItem } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const formatPrice = (price: number) => price.toFixed(2);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${params.productId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
        const mainImage = data.images.find((img: ProductImage) => img.isMain)?.url || data.images[0]?.url;
        setSelectedImageUrl(mainImage);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    setIsSuccessDialogOpen(true);
  };
  const handleDirectPurchase = async (formData: any) => {
    if (!product) {
      toast.error("Produit non disponible");
      return;
    }

    setSubmitting(true);

    const orderData = {
      ...formData,
      productId: product.id,
      price: product.salePrice || product.price,
    };

    try {
      const response = await fetch("/api/orders/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      setUserDetails({
        fullName: formData.fullName,
        address: formData.address,
        governorate: formData.governorate,
        phone: formData.phone,
      });

      setIsSuccessDialogOpen(true);
      toast.success("Commande placée avec succès! Nous vous contacterons bientôt.");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#B4941F]" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!product || !selectedImageUrl) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="flex gap-4">
          {/* Thumbnail Images */}
          <div className="flex flex-col gap-2">
            {product.images.map((image) => (
              <button
                key={image.id}
                onMouseEnter={() => setSelectedImageUrl(image.url)}
                className={cn(
                  "relative w-20 h-20 overflow-hidden rounded-lg bg-gray-100 hover:ring-2 hover:ring-[#B4941F] transition-all",
                  selectedImageUrl === image.url && "ring-2 ring-[#B4941F]"
                )}
              >
                <Image
                  src={image.url}
                  alt={`${product.name} - ${image.position || ''}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
          {/* Main Image */}
          <div className="flex-1 relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={selectedImageUrl}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-300"
              priority
              quality={90}
              sizes="(max-width: 720px) 100vw, 50vw"
            />
          </div>
        </div>
        {/* Product Details & Direct Purchase Form */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold text-[#B4941F]">
              {product.salePrice ? (
                <>
                  <span>{formatPrice(product.salePrice)} TND</span>
                  <span className="text-lg text-gray-500 line-through ml-2">
                    {formatPrice(product.price)} TND
                  </span>
                </>
              ) : (
                <span>{formatPrice(product.price)} TND</span>
              )}
            </span>
          </div>
          {/* Description */}
          <div className="text-gray-600 whitespace-pre-line">
            {product.description}
          </div>
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full py-6 text-lg text-white bg-[#B4941F] hover:bg-black hover:text-[#B4941F]"
            size="lg"
          >
            Ajouter au Panier
          </Button>
          {/* Additional Information */}
          <div className="border-t border-[#B4941F]/20 pt-6 mt-6">
            <h3 className="text-sm font-medium mb-4 text-[#B4941F]">Détails</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Catégorie: {product.category}</li>
              {product.collaborateur && (
                <li>Modèle: {product.collaborateur}</li>
              )}
            </ul>
          </div>
          {/* Direct Purchase Form */}
          <DirectPurchaseForm
            onSubmit={handleDirectPurchase}
            className="space-y-4"
            isSubmitting={submitting}
            productInfo={{
              name: product.name,
              price: product.salePrice || product.price,
              mainImageUrl: selectedImageUrl,
            }}
          />
        </div>
      </div>
      {/* Suggested Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Produits suggérés</h2>
        <ProductGrid filters={{ category: product.category, collaborator: "all", sort: "featured", product: "" }} />
      </div>
    </div>
  );
}