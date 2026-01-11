import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await params

    const existingRsvp = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: { eventId, userId: session.user.id },
      },
    })

    if (existingRsvp) {
      await prisma.eventRSVP.delete({ where: { id: existingRsvp.id } })
      return NextResponse.json({ message: 'RSVP cancelled' })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { rsvps: true } } },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.maxAttendees && event._count.rsvps >= event.maxAttendees) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 })
    }

    await prisma.eventRSVP.create({
      data: { eventId, userId: session.user.id },
    })

    return NextResponse.json({ message: 'RSVP confirmed' }, { status: 201 })
  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 })
  }
}
