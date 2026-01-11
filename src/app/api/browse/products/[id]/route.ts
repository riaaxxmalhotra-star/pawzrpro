import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id, active: true },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            supplierProfile: { select: { storeName: true } },
          },
        },
      },
    })

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
