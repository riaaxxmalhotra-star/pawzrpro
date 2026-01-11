import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDailyRoom } from '@/lib/daily'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId } = await req.json()

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { providerId: true, ownerId: true, videoRoomUrl: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.providerId !== session.user.id && booking.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Return existing room if available
    if (booking.videoRoomUrl) {
      return NextResponse.json({ url: booking.videoRoomUrl })
    }

    // Create new room
    const room = await createDailyRoom(`pawzr-${bookingId}`)

    await prisma.booking.update({
      where: { id: bookingId },
      data: { videoRoomUrl: room.url },
    })

    return NextResponse.json({ url: room.url })
  } catch (error) {
    console.error('Failed to create video room:', error)
    return NextResponse.json({ error: 'Failed to create video room' }, { status: 500 })
  }
}
