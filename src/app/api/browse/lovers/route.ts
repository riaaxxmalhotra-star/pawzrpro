import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const city = searchParams.get('city')

    const providers = await prisma.user.findMany({
      where: {
        role: 'LOVER',
        suspended: false,
        ...(city && { city: { contains: city } }),
        ...(type && {
          services: {
            some: {
              type: type as 'WALKING' | 'SITTING' | 'BOARDING',
              active: true,
            },
          },
        }),
      },
      include: {
        loverProfile: true,
        services: {
          where: { active: true },
        },
        reviewsReceived: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const providersWithStats = providers.map((provider: typeof providers[number]) => {
      const ratings = provider.reviewsReceived.map((r: { rating: number }) => r.rating)
      const averageRating = ratings.length > 0
        ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
        : 0

      return {
        id: provider.id,
        name: provider.name,
        avatar: provider.avatar,
        bio: provider.bio,
        city: provider.city,
        aadhaarVerified: provider.aadhaarVerified,
        loverProfile: provider.loverProfile,
        services: provider.services,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
      }
    })

    return NextResponse.json(providersWithStats)
  } catch (error) {
    console.error('Failed to fetch providers:', error)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}
