import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supplier = await prisma.supplierProfile.findFirst({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
    })

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { supplierId: id, active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      ...supplier,
      products,
    })
  } catch (error) {
    console.error('Fetch supplier error:', error)
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 })
  }
}
