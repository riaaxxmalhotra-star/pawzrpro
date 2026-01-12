import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  // Note: Not using adapter with JWT strategy to avoid conflicts
  // adapter: PrismaAdapter(prisma) as Adapter,
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
    async redirect({ url, baseUrl }) {
      // Handle redirect after OAuth
      // Check if this is coming from the mobile app
      if (url.startsWith(baseUrl)) {
        return url
      }
      // For relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      return baseUrl
    },
    async jwt({ token, user, account, trigger, session }) {
      // On initial sign in
      if (account && user) {
        // For OAuth providers, ensure user exists in database and get their data
        if (account.provider === 'google' || account.provider === 'apple') {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          // If user doesn't exist, create them (OAuth user)
          if (!dbUser) {
            // Get the role from localStorage via the signup flow
            // Default to OWNER, will be updated in onboarding
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || 'User',
                avatar: user.image,
                role: 'OWNER', // Default role, updated in onboarding
              },
            })
          }

          token.id = dbUser.id
          token.role = dbUser.role
          token.email = dbUser.email
        } else {
          // For credentials provider
          token.id = user.id
          token.role = user.role
          token.email = user.email
        }
      }

      // Handle session updates (e.g., after role change in onboarding)
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.role) token.role = session.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
      }
      return session
    },
    async signIn({ user, account }) {
      // For OAuth sign-ins, check if user is suspended
      if (account?.provider === 'google' || account?.provider === 'apple') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (existingUser?.suspended) {
          return false
        }
      }
      return true
    },
  },
}
