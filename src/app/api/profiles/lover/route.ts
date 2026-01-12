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

    // Get or create lover profile
    let loverProfile = await prisma.loverProfile.findUnique({
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

    if (!loverProfile) {
      // Create a new lover profile
      loverProfile = await prisma.loverProfile.create({
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

    return NextResponse.json(loverProfile)
  } catch (error) {
    console.error('Get lover profile error:', error)
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
    const { experience, certifications, hourlyRate, availability, serviceRadius } = body

    // Update or create lover profile
    const loverProfile = await prisma.loverProfile.upsert({
      where: { userId: session.user.id },
      update: {
        experience,
        certifications,
        hourlyRate,
        availability,
        serviceRadius,
      },
      create: {
        userId: session.user.id,
        experience,
        certifications,
        hourlyRate,
        availability,
        serviceRadius,
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

    // Mark profile as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileComplete: true },
    })

    return NextResponse.json(loverProfile)
  } catch (error) {
    console.error('Update lover profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
