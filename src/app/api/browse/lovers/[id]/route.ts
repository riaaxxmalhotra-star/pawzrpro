import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const provider = await prisma.user.findUnique({
      where: { id, role: 'LOVER', suspended: false },
      include: {
        loverProfile: true,
        services: {
          where: { active: true },
        },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const ratings = provider.reviewsReceived.map((r) => r.rating)
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

    return NextResponse.json({
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
      reviews: provider.reviewsReceived.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        reviewer: r.reviewer,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch provider:', error)
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 })
  }
}
