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

    // Get or create supplier profile
    let supplierProfile = await prisma.supplierProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            zipCode: true,
          },
        },
      },
    })

    if (!supplierProfile) {
      // Create a new supplier profile
      supplierProfile = await prisma.supplierProfile.create({
        data: {
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              zipCode: true,
            },
          },
        },
      })
    }

    return NextResponse.json(supplierProfile)
  } catch (error) {
    console.error('Get supplier profile error:', error)
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { storeName, description, logo, website, phone, address, city, zipCode } = body

    // Update user info
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        address,
        city,
        zipCode,
        profileComplete: true,
      },
    })

    // Update or create supplier profile
    const supplierProfile = await prisma.supplierProfile.upsert({
      where: { userId: session.user.id },
      update: {
        storeName,
        description,
        logo,
        website,
      },
      create: {
        userId: session.user.id,
        storeName,
        description,
        logo,
        website,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            zipCode: true,
          },
        },
      },
    })

    return NextResponse.json(supplierProfile)
  } catch (error) {
    console.error('Update supplier profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
