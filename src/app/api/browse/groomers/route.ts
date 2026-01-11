import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')

    const groomers = await prisma.user.findMany({
      where: {
        role: 'GROOMER',
        suspended: false,
        ...(city && { city: { contains: city } }),
      },
      include: {
        groomerProfile: true,
        reviewsReceived: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const groomersWithStats = groomers.map((groomer: typeof groomers[number]) => {
      const ratings = groomer.reviewsReceived.map((r: { rating: number }) => r.rating)
      const averageRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0

      return {
        id: groomer.id,
        name: groomer.name,
        avatar: groomer.avatar,
        bio: groomer.bio,
        city: groomer.city,
        groomerProfile: groomer.groomerProfile,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
      }
    })

    return NextResponse.json(groomersWithStats)
  } catch (error) {
    console.error('Failed to fetch groomers:', error)
    return NextResponse.json({ error: 'Failed to fetch groomers' }, { status: 500 })
  }
}
