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

    const pets = await prisma.pet.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pets)
  } catch (error) {
    console.error('Failed to fetch pets:', error)
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, species, breed, age, weight, photo, medicalNotes, behaviorNotes, vaccinated, neutered } = body

    if (!name || !species) {
      return NextResponse.json({ error: 'Name and species are required' }, { status: 400 })
    }

    const pet = await prisma.pet.create({
      data: {
        ownerId: session.user.id,
        name,
        species,
        breed,
        age,
        weight,
        photo,
        medicalNotes,
        behaviorNotes,
        vaccinated: vaccinated || false,
        neutered: neutered || false,
      },
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error('Failed to create pet:', error)
    return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 })
  }
}
