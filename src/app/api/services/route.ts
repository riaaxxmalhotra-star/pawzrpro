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

    const services = await prisma.service.findMany({
      where: { providerId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'LOVER') {
      return NextResponse.json({ error: 'Only pet lovers can create services' }, { status: 403 })
    }

    const body = await req.json()
    const { type, name, description, price, duration, availability } = body

    if (!type || !name || !price || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        providerId: session.user.id,
        type,
        name,
        description,
        price,
        duration,
        availability,
        active: true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Failed to create service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
