import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST - Send verification code to phone
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Validate phone number format (basic validation)
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneVerified: true, phone: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete any existing codes for this user
    await prisma.verificationCode.deleteMany({
      where: { userId: session.user.id, type: 'phone' },
    })

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save code to database
    await prisma.verificationCode.create({
      data: {
        userId: session.user.id,
        type: 'phone',
        code,
        target: phone,
        expiresAt,
      },
    })

    // Update user's phone number
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
    })

    // In production, send SMS using a service like Twilio
    // For now, we'll log it and return success
    console.log(`Phone verification code for ${phone}: ${code}`)

    // TODO: Implement actual SMS sending
    // Example with Twilio:
    // const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    // await twilio.messages.create({
    //   body: `Your Pawzr verification code is: ${code}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // })

    return NextResponse.json({
      message: 'Verification code sent to your phone',
      // Remove this in production - only for testing
      debug_code: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    console.error('Send phone verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}

// PUT - Verify the code
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await req.json()

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 })
    }

    // Find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: session.user.id,
        type: 'phone',
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!verificationCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    // Mark code as verified
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { verified: true },
    })

    // Update user's phone verification status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phoneVerified: new Date() },
    })

    return NextResponse.json({ message: 'Phone number verified successfully' })
  } catch (error) {
    console.error('Verify phone error:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}
