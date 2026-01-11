import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const supplierId = searchParams.get('supplierId')

    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category && { category }),
        ...(supplierId && { supplierId }),
        supplier: {
          suspended: false,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            supplierProfile: {
              select: { storeName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
