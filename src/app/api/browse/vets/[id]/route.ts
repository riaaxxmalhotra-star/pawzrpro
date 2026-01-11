import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const vet = await prisma.user.findUnique({
      where: { id, role: 'VET', suspended: false },
      include: {
        vetProfile: true,
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

    if (!vet) {
      return NextResponse.json({ error: 'Vet not found' }, { status: 404 })
    }

    const ratings = vet.reviewsReceived.map((r) => r.rating)
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

    return NextResponse.json({
      id: vet.id,
      name: vet.name,
      avatar: vet.avatar,
      bio: vet.bio,
      city: vet.city,
      vetProfile: vet.vetProfile,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      reviews: vet.reviewsReceived.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        reviewer: r.reviewer,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch vet:', error)
    return NextResponse.json({ error: 'Failed to fetch vet' }, { status: 500 })
  }
}
