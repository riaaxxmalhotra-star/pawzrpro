import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Update live location
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { latitude, longitude, enabled } = await req.json()

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationUpdate: new Date(),
        liveLocationEnabled: enabled ?? true,
      },
      select: {
        id: true,
        lastLatitude: true,
        lastLongitude: true,
        lastLocationUpdate: true,
        liveLocationEnabled: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update location error:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

// Get another user's live location (for bookings)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')

    if (!targetUserId || !bookingId) {
      return NextResponse.json({ error: 'Missing userId or bookingId' }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the booking exists and involves both users
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { ownerId: currentUser.id, providerId: targetUserId },
          { ownerId: targetUserId, providerId: currentUser.id },
        ],
        status: 'ACCEPTED', // Only for accepted bookings
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'No active booking found' }, { status: 403 })
    }

    // Get target user's location
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        lastLatitude: true,
        lastLongitude: true,
        lastLocationUpdate: true,
        liveLocationEnabled: true,
      },
    })

    if (!targetUser || !targetUser.liveLocationEnabled) {
      return NextResponse.json({ error: 'Location not available' }, { status: 404 })
    }

    // Check if location is recent (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (!targetUser.lastLocationUpdate || targetUser.lastLocationUpdate < fiveMinutesAgo) {
      return NextResponse.json({
        ...targetUser,
        stale: true,
      })
    }

    return NextResponse.json(targetUser)
  } catch (error) {
    console.error('Get location error:', error)
    return NextResponse.json({ error: 'Failed to get location' }, { status: 500 })
  }
}
