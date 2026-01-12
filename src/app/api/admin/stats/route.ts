import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to check role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
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
      _sum: { platformFee: true, total: true },
    })

    const totalOrders = orders._count.id
    const platformRevenue = orders._sum.platformFee || 0
    const totalSales = orders._sum.total || 0

    // Get pending professional verifications (vets and groomers)
    const pendingProfessionalVerifications = await prisma.user.count({
      where: {
        role: { in: ['VET', 'GROOMER'] },
        verified: false,
      },
    })

    // Get pending Aadhaar verifications
    const pendingAadhaarVerifications = await prisma.user.count({
      where: {
        aadhaarImage: { not: null },
        aadhaarVerified: false,
      },
    })

    // Get user growth - last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newUsersLast7Days = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    })

    // Get user growth - last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    // Get recent users by day (last 7 days)
    const dailyGrowth = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      dailyGrowth.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

    // Get verified vs unverified users
    const verifiedUsers = await prisma.user.count({
      where: { aadhaarVerified: true },
    })

    // Get recent bookings count
    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    })

    // Get booking revenue (sum of prices)
    const bookingRevenue = await prisma.booking.aggregate({
      _sum: { price: true },
      where: { status: 'COMPLETED' },
    })

    return NextResponse.json({
      totalUsers,
      usersByRole,
      totalBookings,
      totalOrders,
      platformRevenue,
      totalSales,
      pendingProfessionalVerifications,
      pendingAadhaarVerifications,
      newUsersLast7Days,
      newUsersLast30Days,
      dailyGrowth,
      verifiedUsers,
      recentBookings,
      bookingRevenue: bookingRevenue._sum.price || 0,
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
