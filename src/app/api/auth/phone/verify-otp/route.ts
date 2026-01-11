import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s-]/g, '')

    // Find the verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        target: normalizedPhone,
        code: otp,
        type: 'PHONE_LOGIN',
        expiresAt: { gt: new Date() },
      },
    })

    if (!verificationCode) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Delete the used OTP
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    })

    // Find user with this phone number
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    })

    // If no user exists with this phone, check if we should create one
    // For security, we only allow login for existing users by default
    // New users should sign up first
    if (!user) {
      return NextResponse.json({
        error: 'No account found with this phone number. Please sign up first.',
        needsSignup: true
      }, { status: 404 })
    }

    if (user.suspended) {
      return NextResponse.json({ error: 'Your account has been suspended' }, { status: 403 })
    }

    // Generate a temporary token for phone login
    const phoneLoginToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store the token
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        target: user.id,
        code: phoneLoginToken,
        type: 'PHONE_LOGIN_TOKEN',
        expiresAt: tokenExpiry,
      },
    })

    // Update user's phoneVerified status
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: new Date() },
    })

    return NextResponse.json({
      success: true,
      phoneLoginToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Failed to verify OTP:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
