import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// This route creates an admin user
// In production, you should protect this route or remove it after initial setup
export async function POST(req: NextRequest) {
  try {
    const { email, password, secretKey } = await req.json()

    // Simple secret key check - in production use a more secure method
    // Set ADMIN_SETUP_KEY in your environment variables
    const setupKey = process.env.ADMIN_SETUP_KEY || 'pawzr-admin-setup-2024'

    if (secretKey !== setupKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (existingAdmin) {
      return NextResponse.json({
        error: 'Admin user already exists',
        message: 'Use admin-login page to sign in'
      }, { status: 400 })
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: await bcrypt.hash(password, 12),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      return NextResponse.json({
        message: 'Existing user updated to admin',
        user: updatedUser,
      })
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        verified: true,
        aadhaarVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: admin,
    }, { status: 201 })
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}
