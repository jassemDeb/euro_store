import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.phone || !data.address || !data.productId || !data.quantity || !data.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        images: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerName: data.fullName,
        phoneNumber: data.phone,
        address: `${data.address}${data.governorate ? `, ${data.governorate}` : ''}`,
        totalAmount: data.price * data.quantity,
        status: 'PENDING',
        items: {
          create: [
            {
              productId: data.productId,
              quantity: data.quantity,
              price: data.price,
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}