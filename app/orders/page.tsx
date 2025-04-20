'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  isMain: boolean;
  position: string;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: string;
  collaborateur: string | null;
  showInHome: boolean;
  showInPromo: boolean;
  showInTopSales: boolean;
  priority: number;
  viewCount: number; 
  orderCount: number; 
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/users/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError('Error loading orders');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3f61]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your orders
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <h3 className="text-lg font-medium text-gray-900">
                No orders found
              </h3>
              <p className="mt-2 text-gray-600">
                You have not placed any orders yet.
              </p>
              <Link
                href="/collections"
                className="mt-4 inline-block rounded-md bg-[#7c3f61] px-4 py-2 text-sm font-medium text-white hover:bg-[#B59851] transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-lg bg-white shadow"
                >
                  <div className="border-b border-gray-200 bg-[#7c3f61]/5 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Placed on{' '}
                          {format(new Date(order.createdAt), 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-[#7c3f61]/10 px-3 py-1 text-sm font-medium text-[#7c3f61]">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6">
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <li key={item.id} className="py-5">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="relative h-20 w-20">
                                  {item.product.images && item.product.images.length > 0 ? (
                                    <Image
                                      src={item.product.images.find((img: ProductImage) => img.url)?.url || '/default-product.jpg'}
                                      alt={item.product.images.find((img: ProductImage) => img.url)?.alt || item.product.name}
                                      fill
                                      className="rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="h-20 w-20 flex items-center justify-center bg-gray-200 text-gray-500">
                                      No Image
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.product.name}
                                </p>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                  <span>Quantité: {item.quantity}</span>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  <span>Prix: {item.product.price.toFixed(2)} TND</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-base font-medium text-gray-900">
                          Total
                        </span>
                        <span className="text-base font-medium text-[#7c3f61]">
                          TND{order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}