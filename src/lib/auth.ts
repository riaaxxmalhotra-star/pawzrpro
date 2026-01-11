import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || '',
      clientSecret: process.env.APPLE_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('No user found with this email')
        }

        if (user.suspended) {
          throw new Error('Your account has been suspended')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        }
      },
    }),
    CredentialsProvider({
      id: 'phone',
      name: 'phone',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        phoneLoginToken: { label: 'Phone Login Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.phoneLoginToken) {
          throw new Error('Invalid phone login credentials')
        }

        // Verify the phone login token
        const tokenRecord = await prisma.verificationCode.findFirst({
          where: {
            userId: credentials.userId,
            code: credentials.phoneLoginToken,
            type: 'PHONE_LOGIN_TOKEN',
            expiresAt: { gt: new Date() },
          },
        })

        if (!tokenRecord) {
          throw new Error('Invalid or expired phone login token')
        }

        // Delete the used token
        await prisma.verificationCode.delete({
          where: { id: tokenRecord.id },
        })

        // Get the user
        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        })

        if (!user) {
          throw new Error('User not found')
        }

        if (user.suspended) {
          throw new Error('Your account has been suspended')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name
        token.role = session.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account }) {
      // For OAuth sign-ins, check if user exists and handle role
      if (account?.provider === 'google' || account?.provider === 'apple') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (existingUser?.suspended) {
          return false
        }

        // If new OAuth user, set default role (will be updated in onboarding)
        if (!existingUser) {
          // User will be created by adapter, we'll update role in onboarding
          return true
        }
      }
      return true
    },
  },
}
