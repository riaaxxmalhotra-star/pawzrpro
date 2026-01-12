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

    // Get or create vet profile
    let vetProfile = await prisma.vetProfile.findUnique({
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

    if (!vetProfile) {
      // Create a new vet profile
      vetProfile = await prisma.vetProfile.create({
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

    return NextResponse.json(vetProfile)
  } catch (error) {
    console.error('Get vet profile error:', error)
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
      clinicName,
      clinicAddress,
      clinicPhone,
      hours,
      license,
      services,
      specializations,
      videoCallRate,
    } = body

    // Update or create vet profile
    const vetProfile = await prisma.vetProfile.upsert({
      where: { userId: session.user.id },
      update: {
        clinicName,
        clinicAddress,
        clinicPhone,
        hours,
        license,
        services,
        specializations,
        videoCallRate,
      },
      create: {
        userId: session.user.id,
        clinicName,
        clinicAddress,
        clinicPhone,
        hours,
        license,
        services,
        specializations,
        videoCallRate,
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

    return NextResponse.json(vetProfile)
  } catch (error) {
    console.error('Update vet profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
