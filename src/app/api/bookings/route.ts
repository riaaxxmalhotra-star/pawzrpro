import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role

    // Different queries based on role
    const whereClause = ['LOVER', 'VET', 'GROOMER'].includes(role)
      ? { providerId: session.user.id }
      : { ownerId: session.user.id }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, avatar: true, aadhaarVerified: true },
        },
        provider: {
          select: { id: true, name: true, avatar: true, aadhaarVerified: true },
        },
        pet: {
          select: { id: true, name: true, species: true },
        },
        service: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { providerId, providerType, petId, serviceId, date, time, duration, notes } = body

    if (!providerId || !providerType || !date || !time || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get service price if serviceId provided
    let price = 0
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } })
      if (service) {
        price = service.price
      }
    }

    const booking = await prisma.booking.create({
      data: {
        ownerId: session.user.id,
        providerId,
        providerType,
        petId,
        serviceId,
        date: new Date(date),
        time,
        duration,
        price,
        notes,
        status: 'PENDING',
      },
      include: {
        provider: {
          select: { id: true, name: true },
        },
        pet: {
          select: { id: true, name: true },
        },
      },
    })

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: providerId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${session.user.name} has requested a booking`,
        link: '/dashboard/lover/requests',
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
