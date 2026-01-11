import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

type RoleType = 'OWNER' | 'LOVER' | 'VET' | 'GROOMER' | 'SUPPLIER' | 'ADMIN'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, password, name, role, phoneVerified } = body

    // Validate required fields - need either email or phone
    if ((!email && !phone) || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: RoleType[] = ['OWNER', 'LOVER', 'VET', 'GROOMER', 'SUPPLIER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check if user already exists (by email or phone)
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }
    }

    if (phone) {
      const normalizedPhone = phone.replace(/[\s-]/g, '')
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
      })

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Normalize phone if provided
    const normalizedPhone = phone ? phone.replace(/[\s-]/g, '') : null

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: normalizedPhone,
        password: hashedPassword,
        name,
        role,
        profileComplete: false,
        phoneVerified: phoneVerified ? new Date() : null,
      },
    })

    // Create role-specific profile
    if (role === 'LOVER') {
      await prisma.loverProfile.create({
        data: { userId: user.id },
      })
    } else if (role === 'VET') {
      await prisma.vetProfile.create({
        data: { userId: user.id },
      })
    } else if (role === 'GROOMER') {
      await prisma.groomerProfile.create({
        data: { userId: user.id },
      })
    } else if (role === 'SUPPLIER') {
      await prisma.supplierProfile.create({
        data: { userId: user.id },
      })
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
