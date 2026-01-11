import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Normalize phone number (remove spaces, dashes)
    const normalizedPhone = phone.replace(/[\s-]/g, '')

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTPs for this phone
    await prisma.verificationCode.deleteMany({
      where: {
        target: normalizedPhone,
        type: 'PHONE_LOGIN',
      },
    })

    // Create new OTP
    await prisma.verificationCode.create({
      data: {
        target: normalizedPhone,
        code: otp,
        type: 'PHONE_LOGIN',
        expiresAt,
      },
    })

    // In production, send SMS via Twilio/AWS SNS
    // For now, we'll return the OTP in development mode
    console.log(`[DEV] Phone Login OTP for ${normalizedPhone}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Only include debug_code in development
      ...(process.env.NODE_ENV === 'development' && { debug_code: otp }),
    })
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
