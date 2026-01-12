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

    // Clear Aadhaar data (rejected)
    const user = await prisma.user.update({
      where: { id },
      data: {
        aadhaarNumber: null,
        aadhaarImage: null,
        aadhaarVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        aadhaarNumber: true,
        aadhaarImage: true,
        aadhaarVerified: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to reject Aadhaar:', error)
    return NextResponse.json({ error: 'Failed to reject Aadhaar' }, { status: 500 })
  }
}
