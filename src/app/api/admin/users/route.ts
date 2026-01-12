import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const verification = searchParams.get('verification')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (verification) {
      switch (verification) {
        case 'pending':
          where.verified = false
          where.role = { in: ['VET', 'GROOMER', 'LOVER'] }
          break
        case 'pending-aadhaar':
          where.aadhaarImage = { not: null }
          where.aadhaarVerified = false
          break
        case 'verified':
          where.aadhaarVerified = true
          break
        case 'suspended':
          where.suspended = true
          break
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        verified: true,
        suspended: true,
        aadhaarNumber: true,
        aadhaarImage: true,
        aadhaarVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
