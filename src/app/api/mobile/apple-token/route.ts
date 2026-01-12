import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encode } from 'next-auth/jwt'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { idToken, user: appleUser } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: 'Missing identity token' }, { status: 400 })
    }

    // Decode the Apple ID token (it's a JWT)
    const decoded = jwt.decode(idToken) as any

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Invalid identity token' }, { status: 401 })
    }

    // Get email from token or from user info (Apple only sends email on first sign in)
    const email = decoded.email || appleUser?.email

    if (!email) {
      return NextResponse.json({ error: 'No email available' }, { status: 400 })
    }

    // Build name from Apple user info if available
    let name = 'User'
    if (appleUser?.fullName) {
      const { givenName, familyName } = appleUser.fullName
      if (givenName || familyName) {
        name = [givenName, familyName].filter(Boolean).join(' ')
      }
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'OWNER',
        },
      })
    }

    if (user.suspended) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // Create a NextAuth-compatible JWT token
    const jwtToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.avatar,
      },
      secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.avatar,
      },
      token: jwtToken,
    })
  } catch (error) {
    console.error('Apple token exchange error:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
