import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encode } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json()

    if (!token || !userId) {
      return NextResponse.json({ error: 'Missing token or userId' }, { status: 400 })
    }

    // Verify the login token
    const tokenRecord = await prisma.verificationCode.findFirst({
      where: {
        userId,
        code: token,
        type: 'MOBILE_LOGIN_TOKEN',
        expiresAt: { gt: new Date() },
      },
    })

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.suspended) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // Delete the used token
    await prisma.verificationCode.delete({
      where: { id: tokenRecord.id },
    })

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

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.avatar,
      },
      redirectTo: '/onboarding',
    })

    // Set the session cookie
    const isProduction = process.env.NODE_ENV === 'production'
    response.cookies.set('next-auth.session-token', jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // Also set the callback URL cookie for NextAuth
    if (isProduction) {
      response.cookies.set('__Secure-next-auth.session-token', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      })
    }

    return response
  } catch (error) {
    console.error('Mobile token exchange error:', error)
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 })
  }
}
