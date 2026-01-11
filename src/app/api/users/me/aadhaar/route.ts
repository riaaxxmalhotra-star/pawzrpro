import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { aadhaarImage } = await req.json()

    if (!aadhaarImage) {
      return NextResponse.json({ error: 'Aadhaar image is required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        aadhaarImage,
        aadhaarVerified: false, // Will be verified by admin
      },
      select: {
        id: true,
        aadhaarImage: true,
        aadhaarVerified: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Aadhaar upload error:', error)
    return NextResponse.json({ error: 'Failed to upload Aadhaar' }, { status: 500 })
  }
}
