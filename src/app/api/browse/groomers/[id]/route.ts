import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const groomer = await prisma.user.findUnique({
      where: { id, role: 'GROOMER', suspended: false },
      include: {
        groomerProfile: true,
        reviewsReceived: {
          include: { reviewer: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!groomer) return NextResponse.json({ error: 'Groomer not found' }, { status: 404 })

    const ratings = groomer.reviewsReceived.map((r) => r.rating)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    return NextResponse.json({
      id: groomer.id,
      name: groomer.name,
      avatar: groomer.avatar,
      bio: groomer.bio,
      city: groomer.city,
      groomerProfile: groomer.groomerProfile,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      reviews: groomer.reviewsReceived.map((r) => ({
        id: r.id, rating: r.rating, comment: r.comment, reviewer: r.reviewer,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch groomer:', error)
    return NextResponse.json({ error: 'Failed to fetch groomer' }, { status: 500 })
  }
}
