import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { aadhaarNumber, aadhaarImage } = await req.json()

    if (!aadhaarImage) {
      return NextResponse.json({ error: 'Aadhaar image is required' }, { status: 400 })
    }

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return NextResponse.json({ error: 'Valid 12-digit Aadhaar number is required' }, { status: 400 })
    }

    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json({ error: 'Aadhaar number must be 12 digits' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        aadhaarNumber,
        aadhaarImage,
        aadhaarVerified: false, // Will be verified by admin
      },
      select: {
        id: true,
        aadhaarNumber: true,
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        aadhaarNumber: true,
        aadhaarImage: true,
        aadhaarVerified: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to get Aadhaar status:', error)
    return NextResponse.json({ error: 'Failed to get Aadhaar status' }, { status: 500 })
  }
}
