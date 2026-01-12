import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// This endpoint is called after Firebase phone verification succeeds
// It creates/finds the user and returns a login token for NextAuth

export async function POST(req: NextRequest) {
  try {
    const { phone, firebaseUid, action } = await req.json()

    if (!phone || !firebaseUid) {
      return NextResponse.json({ error: 'Phone and Firebase UID are required' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s-]/g, '')

    // Find user with this phone number
    let user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    })

    if (action === 'login') {
      // Login flow - user must exist
      if (!user) {
        return NextResponse.json({
          error: 'No account found with this phone number',
          needsSignup: true,
        }, { status: 404 })
      }

      if (user.suspended) {
        return NextResponse.json({ error: 'Your account has been suspended' }, { status: 403 })
      }
    }

    // For signup, user should not exist (handled by the signup flow)
    // This endpoint is mainly for login verification

    if (user) {
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

      // Update phoneVerified status and store Firebase UID
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: new Date(),
          // Store Firebase UID for future reference (optional field)
        },
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
    }

    // No user found - return for signup flow
    return NextResponse.json({
      success: true,
      verified: true,
      phone: normalizedPhone,
      needsSignup: true,
    })
  } catch (error) {
    console.error('Firebase phone auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
