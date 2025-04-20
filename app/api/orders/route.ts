import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('userId'); // Get the user ID from cookies

    const body = await req.json();
    console.log('Received order request body:', body);
    
    const { customerName, phoneNumber, address, totalAmount, items } = body;

    // Validate required fields
    if (!customerName || !phoneNumber || !address || !totalAmount) {
      console.error('Missing customer details:', { customerName, phoneNumber, address, totalAmount });
      return NextResponse.json(
        { error: 'Missing required customer fields', details: { customerName, phoneNumber, address, totalAmount } },
        { status: 400 }
      );
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Missing or invalid items array:', items);
      return NextResponse.json(
        { error: 'Missing or invalid items array', details: items },
        { status: 400 }
      );
    }

    // Validate each item and check stock
    for (const item of items) {
      console.log('Validating item:', item);
      
      if (!item.productId || !item.quantity || !item.price) {
        console.error('Invalid item data:', item);
        return NextResponse.json(
          { 
            error: 'Invalid item data: missing required fields (productId, quantity, price)', 
            details: item 
          },
          { status: 400 }
        );
      }

      // Verify the product exists
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          stocks: true
        }
      });

      if (!product) {
        console.error(`Product with ID ${item.productId} not found`);
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      // Check if product is in stock
      if (product.stocks.length > 0) {
        const stock = product.stocks[0];
        if (!stock.inStock) {
          console.error(`Product ${item.productId} is out of stock`);
          return NextResponse.json(
            { error: `Product ${item.productId} is out of stock` },
            { status: 400 }
          );
        }
      } else {
        console.error(`Stock information not found for product ${item.productId}`);
        return NextResponse.json(
          { error: `Stock information not found for product ${item.productId}` },
          { status: 400 }
        );
      }
    }

    console.log('All items validated successfully, creating order');
    
    // Create the order with validated items
    const order = await prisma.order.create({
      data: {
        customerName,
        phoneNumber,
        address,
        totalAmount,
        status: 'PENDING',
        userId: userId ? parseInt(userId.value) : undefined, // Link order to user ID if logged in
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                }
              }
            }
          }
        },
      },
    });

    console.log('Order created successfully:', order.id);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);

    // Improved error handling
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create order',
          details: error.message,
          type: error.constructor.name,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order', details: 'Unknown error' },
      { status: 500 }
    );
  }
}