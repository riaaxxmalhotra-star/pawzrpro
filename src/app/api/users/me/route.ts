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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        bio: true,
        avatar: true,
        role: true,
        verified: true,
        emailVerified: true,
        phoneVerified: true,
        aadhaarImage: true,
        aadhaarVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, address, city, zipCode, bio, avatar, role, profileComplete } = body

    // Get current user to check if role is being changed
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    // Build update data
    const updateData: Record<string, unknown> = {
      name,
      phone,
      address,
      city,
      zipCode,
      bio,
      avatar,
    }

    if (profileComplete !== undefined) {
      updateData.profileComplete = profileComplete
    }

    // Only update role if provided and user doesn't have one yet (for OAuth users)
    if (role && (!currentUser?.role || currentUser.role === 'OWNER')) {
      updateData.role = role

      // Create role-specific profile if changing role
      if (role !== currentUser?.role) {
        if (role === 'LOVER') {
          await prisma.loverProfile.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id },
            update: {},
          })
        } else if (role === 'VET') {
          await prisma.vetProfile.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id },
            update: {},
          })
        } else if (role === 'GROOMER') {
          await prisma.groomerProfile.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id },
            update: {},
          })
        } else if (role === 'SUPPLIER') {
          await prisma.supplierProfile.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id },
            update: {},
          })
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        bio: true,
        avatar: true,
        role: true,
        verified: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
