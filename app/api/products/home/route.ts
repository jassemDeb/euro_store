import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        showInHome: true, // Only fetch products marked to show in home
      },
      orderBy: [
        {
          priority: 'desc', // First order by priority
        },
        {
          createdAt: 'desc', // Then by creation date
        }
      ],
      include: {
        images: true,
      },
    })

    // Filter out products with no color variants or images
    const filteredProducts = products.filter(product => 
      product.images.length > 0 && 
      product.images.some(image => image.url.length > 0)
    )

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error fetching home products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home products' },
      { status: 500 }
    )
  }
}
