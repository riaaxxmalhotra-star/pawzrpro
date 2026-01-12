import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encode } from 'next-auth/jwt'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken, idToken } = body

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 })
    }

    // Get user info from Google using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user info from Google' }, { status: 401 })
    }

    const googleUser = await userInfoResponse.json()

    if (!googleUser.email) {
      return NextResponse.json({ error: 'No email in Google response' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || 'User',
          avatar: googleUser.picture,
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
    console.error('Google token exchange error:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
