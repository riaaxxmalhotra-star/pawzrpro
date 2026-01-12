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

    // Get user to check verification status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        aadhaarVerified: true,
        aadhaarNumber: true,
        role: true,
      },
    })

    // Get notifications from database
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Create system notifications based on user status
    const systemNotifications = []

    // Add Aadhaar verification reminder for OWNER and LOVER roles
    if (user && (user.role === 'OWNER' || user.role === 'LOVER')) {
      if (!user.aadhaarVerified && !user.aadhaarNumber) {
        systemNotifications.push({
          id: 'system-aadhaar',
          type: 'system',
          title: 'Get Verified!',
          message: 'Submit your Aadhaar to get a verified badge and build trust with other users.',
          link: user.role === 'OWNER' ? '/dashboard/owner/profile' : '/dashboard/lover/profile',
          read: false,
          createdAt: new Date().toISOString(),
          isSystem: true,
        })
      } else if (user.aadhaarNumber && !user.aadhaarVerified) {
        systemNotifications.push({
          id: 'system-aadhaar-pending',
          type: 'system',
          title: 'Verification In Progress',
          message: 'Your Aadhaar is being reviewed. We\'ll notify you once verified!',
          link: null,
          read: false,
          createdAt: new Date().toISOString(),
          isSystem: true,
        })
      }
    }

    // Combine system notifications with user notifications
    const allNotifications = [
      ...systemNotifications,
      ...notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        isSystem: false,
      })),
    ]

    const unreadCount = allNotifications.filter(n => !n.read).length

    return NextResponse.json({
      notifications: allNotifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// Mark notification as read
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllRead } = await req.json()

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
    } else if (notificationId && !notificationId.startsWith('system-')) {
      await prisma.notification.update({
        where: { id: notificationId, userId: session.user.id },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update notifications:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
