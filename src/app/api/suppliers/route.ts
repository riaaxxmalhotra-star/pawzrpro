import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const suppliers = await prisma.supplierProfile.findMany({
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

    // Get product counts for each supplier
    const suppliersWithCounts = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await prisma.product.count({
          where: { supplierId: supplier.userId },
        })
        return {
          ...supplier,
          productCount,
        }
      })
    )

    return NextResponse.json(suppliersWithCounts)
  } catch (error) {
    console.error('Fetch suppliers error:', error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}
