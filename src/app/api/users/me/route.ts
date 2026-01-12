import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        countryCode: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        landmark: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        address: true,
        latitude: true,
        longitude: true,
        googleMapsLink: true,
        liveLocationEnabled: true,
        bio: true,
        instagram: true,
        avatar: true,
        role: true,
        verified: true,
        emailVerified: true,
        phoneVerified: true,
        aadhaarNumber: true,
        aadhaarImage: true,
        aadhaarVerified: true,
      },
    })

    // If user doesn't exist, create them (OAuth user case)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'User',
          role: 'OWNER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          countryCode: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          landmark: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,
          address: true,
          latitude: true,
          longitude: true,
          googleMapsLink: true,
          liveLocationEnabled: true,
          bio: true,
          instagram: true,
          avatar: true,
          role: true,
          verified: true,
          emailVerified: true,
          phoneVerified: true,
          aadhaarNumber: true,
          aadhaarImage: true,
          aadhaarVerified: true,
        },
      })
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      countryCode,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      zipCode,
      address,
      latitude,
      longitude,
      googleMapsLink,
      bio,
      instagram,
      avatar,
      role,
      profileComplete,
    } = body

    // Find user by email (more reliable than ID for OAuth users)
    let currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    // If user doesn't exist, create them (OAuth user case)
    if (!currentUser) {
      currentUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || name || 'User',
          role: role || 'OWNER',
        },
        select: { id: true, role: true },
      })
    }

    const userId = currentUser.id

    // Build update data
    const updateData: Record<string, unknown> = {
      name,
      countryCode,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      zipCode,
      address,
      latitude,
      longitude,
      googleMapsLink,
      bio,
      instagram,
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
            where: { userId },
            create: { userId },
            update: {},
          })
        } else if (role === 'VET') {
          await prisma.vetProfile.upsert({
            where: { userId },
            create: { userId },
            update: {},
          })
        } else if (role === 'GROOMER') {
          await prisma.groomerProfile.upsert({
            where: { userId },
            create: { userId },
            update: {},
          })
        } else if (role === 'SUPPLIER') {
          await prisma.supplierProfile.upsert({
            where: { userId },
            create: { userId },
            update: {},
          })
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        countryCode: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        landmark: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        address: true,
        latitude: true,
        longitude: true,
        googleMapsLink: true,
        bio: true,
        instagram: true,
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
