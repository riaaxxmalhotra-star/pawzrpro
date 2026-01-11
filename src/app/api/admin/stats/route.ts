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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get total users and group by role
    const users = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })

    const usersByRole: Record<string, number> = {}
    for (const u of users) {
      usersByRole[u.role] = u._count.role
    }

    const totalUsers = Object.values(usersByRole).reduce((a, b) => a + b, 0)

    // Get total bookings
    const totalBookings = await prisma.booking.count()

    // Get total orders and platform revenue
    const orders = await prisma.order.aggregate({
      _count: { id: true },
      _sum: { platformFee: true },
    })

    const totalOrders = orders._count.id
    const platformRevenue = orders._sum.platformFee || 0

    // Get pending verifications (vets and groomers not yet verified)
    const pendingVerifications = await prisma.user.count({
      where: {
        role: { in: ['VET', 'GROOMER'] },
        verified: false,
      },
    })

    return NextResponse.json({
      totalUsers,
      usersByRole,
      totalBookings,
      totalOrders,
      platformRevenue,
      pendingVerifications,
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
