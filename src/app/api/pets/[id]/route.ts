import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        bookings: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        prescriptions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    if (pet.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(pet)
  } catch (error) {
    console.error('Failed to fetch pet:', error)
    return NextResponse.json({ error: 'Failed to fetch pet' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingPet = await prisma.pet.findUnique({ where: { id } })

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    if (existingPet.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { name, species, breed, age, weight, photo, medicalNotes, behaviorNotes, vaccinated, neutered } = body

    const pet = await prisma.pet.update({
      where: { id },
      data: {
        name,
        species,
        breed,
        age,
        weight,
        photo,
        medicalNotes,
        behaviorNotes,
        vaccinated,
        neutered,
      },
    })

    return NextResponse.json(pet)
  } catch (error) {
    console.error('Failed to update pet:', error)
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingPet = await prisma.pet.findUnique({ where: { id } })

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    if (existingPet.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.pet.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete pet:', error)
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 })
  }
}
