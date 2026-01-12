import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This route makes a specific user an admin
export async function POST(req: NextRequest) {
  try {
    const { email, secretKey } = await req.json()

    // Simple secret key check
    const setupKey = process.env.ADMIN_SETUP_KEY || 'pawzr-admin-setup-2024'

    if (secretKey !== setupKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!existingUser) {
      // Create new admin user if doesn't exist
      const admin = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: 'ADMIN',
          verified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      return NextResponse.json({
        message: 'Admin user created',
        user: admin,
      }, { status: 201 })
    }

    // Update existing user to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        verified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: 'User updated to admin',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
