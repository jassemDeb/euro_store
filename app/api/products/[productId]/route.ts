import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log('Received product data:', JSON.stringify(data, null, 2));
    console.log('Processing product ID:', productId);

    // Process the product data
    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category.toLowerCase(),
      images: undefined, // images handled separately
      sizes: data.sizes,
      collaborateur: data.collaborateur,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      showInHome: data.showInHome,
      showInPromo: data.showInPromo,
      showInTopSales: data.showInTopSales,
      priority: data.priority,
      viewCount: data.viewCount,
      orderCount: data.orderCount,
    };

    console.log('Processed product data:', JSON.stringify(productData, null, 2));

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: productData,
    });

    console.log('Updated product:', JSON.stringify(updatedProduct, null, 2));

    // Delete existing images for the product
    await prisma.productImage.deleteMany({
      where: { productId: productId }
    });

    console.log('Deleted existing images for product ID:', productId);

    // Create new images for the product
    if (Array.isArray(data.images)) {
      const images = data.images.map((img: any, index: number) => ({
        url: img.url,
        position: img.position || (index === 0 ? 'front' : index === 1 ? 'back' : 'side'),
        isMain: img.isMain || (index === 0),
        productId: productId,
      }));
      await prisma.productImage.createMany({ data: images });
      console.log('Created new images for product:', images);
    }

    // Fetch and return the updated product with images
    const fetchedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
      },
    });

    console.log('Fetched updated product details:', JSON.stringify(fetchedProduct, null, 2));

    return NextResponse.json(fetchedProduct);

  } catch (error) {
    console.error('Error in PUT endpoint:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        ...(error as any)
      });
    }
    return NextResponse.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        images: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Delete the product (cascade will handle related records)
    await prisma.product.delete({
      where: {
        id: productId
      }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
