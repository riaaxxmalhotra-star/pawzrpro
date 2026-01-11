import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
      },
      include: {
        _count: { select: { rsvps: true } },
        rsvps: session?.user?.id
          ? { where: { userId: session.user.id }, select: { id: true } }
          : false,
      },
      orderBy: [{ featured: 'desc' }, { date: 'asc' }],
    })

    return NextResponse.json(
      events.map((event) => ({
        ...event,
        hasRsvped: Array.isArray(event.rsvps) && event.rsvps.length > 0,
        rsvps: undefined,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
