import { NextRequest, NextResponse } from 'next/server'

// Redirect to NextAuth's signin page with mobile callback
// User clicks Google button there, which handles OAuth properly
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://pawzrpro.vercel.app'

  // Redirect to NextAuth signin page with callbackUrl set to mobile-callback
  const signinUrl = new URL(`${baseUrl}/api/auth/signin`)
  signinUrl.searchParams.set('callbackUrl', `${baseUrl}/api/auth/mobile-callback`)

  return NextResponse.redirect(signinUrl.toString())
}

// Also support POST for backwards compatibility
export async function POST(request: NextRequest) {
  return GET(request)
}
