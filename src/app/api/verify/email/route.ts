import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST - Send verification code to email
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }

    // Delete any existing codes for this user
    await prisma.verificationCode.deleteMany({
      where: { userId: session.user.id, type: 'email' },
    })

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save code to database
    await prisma.verificationCode.create({
      data: {
        userId: session.user.id,
        type: 'email',
        code,
        target: user.email,
        expiresAt,
      },
    })

    // In production, send email using a service like SendGrid, Resend, or Nodemailer
    // For now, we'll log it and return success
    console.log(`Email verification code for ${user.email}: ${code}`)

    // TODO: Implement actual email sending
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Pawzr <noreply@pawzr.com>',
    //   to: user.email,
    //   subject: 'Verify your email - Pawzr',
    //   html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
    // })

    return NextResponse.json({
      message: 'Verification code sent to your email',
      // Remove this in production - only for testing
      debug_code: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    console.error('Send email verification error:', error)
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
        type: 'email',
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

    // Update user's email verification status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { emailVerified: new Date() },
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}
