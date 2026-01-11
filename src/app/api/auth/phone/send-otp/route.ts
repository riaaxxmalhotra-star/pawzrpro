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

    // TODO: In production, send SMS via Twilio/MSG91/AWS SNS
    // For now, we'll return the OTP for testing purposes
    console.log(`Phone Login OTP for ${normalizedPhone}: ${otp}`)

    // Check if SMS provider is configured
    const smsConfigured = process.env.TWILIO_ACCOUNT_SID || process.env.MSG91_API_KEY

    if (smsConfigured) {
      // TODO: Implement actual SMS sending here
      // await sendSMS(normalizedPhone, `Your Pawzr verification code is: ${otp}`)
    }

    return NextResponse.json({
      success: true,
      message: smsConfigured ? 'OTP sent to your phone' : 'OTP generated (SMS not configured)',
      // Show debug code until SMS provider is configured
      debug_code: otp,
    })
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
