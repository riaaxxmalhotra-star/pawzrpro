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

    // Get or create groomer profile
    let groomerProfile = await prisma.groomerProfile.findUnique({
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

    if (!groomerProfile) {
      // Create a new groomer profile
      groomerProfile = await prisma.groomerProfile.create({
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

    return NextResponse.json(groomerProfile)
  } catch (error) {
    console.error('Get groomer profile error:', error)
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
    const {
      salonName,
      salonAddress,
      salonPhone,
      hours,
      services,
      photos,
    } = body

    // Update or create groomer profile
    const groomerProfile = await prisma.groomerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        salonName,
        salonAddress,
        salonPhone,
        hours,
        services,
        photos,
      },
      create: {
        userId: session.user.id,
        salonName,
        salonAddress,
        salonPhone,
        hours,
        services,
        photos,
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

    return NextResponse.json(groomerProfile)
  } catch (error) {
    console.error('Update groomer profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
