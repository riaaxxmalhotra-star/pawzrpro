import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await req.json()
    const { type } = body // 'profile' or 'aadhaar'

    const updateData: Record<string, unknown> = {}

    if (type === 'profile') {
      updateData.verified = true
    } else if (type === 'aadhaar') {
      updateData.aadhaarVerified = true
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to verify user:', error)
    return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 })
  }
}
