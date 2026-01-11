import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')

    const vets = await prisma.user.findMany({
      where: {
        role: 'VET',
        suspended: false,
        ...(city && { city: { contains: city } }),
      },
      include: {
        vetProfile: true,
        reviewsReceived: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const vetsWithStats = vets.map((vet: typeof vets[number]) => {
      const ratings = vet.reviewsReceived.map((r: { rating: number }) => r.rating)
      const averageRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0

      return {
        id: vet.id,
        name: vet.name,
        avatar: vet.avatar,
        bio: vet.bio,
        city: vet.city,
        vetProfile: vet.vetProfile,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
      }
    })

    return NextResponse.json(vetsWithStats)
  } catch (error) {
    console.error('Failed to fetch vets:', error)
    return NextResponse.json({ error: 'Failed to fetch vets' }, { status: 500 })
  }
}
