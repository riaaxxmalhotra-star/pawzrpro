import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const completedBookings = await prisma.booking.findMany({
      where: {
        providerId: session.user.id,
        status: 'COMPLETED',
      },
      select: { price: true, createdAt: true },
    })

    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = completedBookings
      .filter((b) => new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + b.price, 0)

    const pendingBookings = await prisma.booking.findMany({
      where: {
        providerId: session.user.id,
        status: 'ACCEPTED',
      },
      select: { price: true },
    })

    const pendingPayouts = pendingBookings.reduce((sum, b) => sum + b.price, 0)

    return NextResponse.json({
      totalEarnings,
      thisMonth,
      completedBookings: completedBookings.length,
      pendingPayouts,
    })
  } catch (error) {
    console.error('Failed to fetch earnings:', error)
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 })
  }
}
