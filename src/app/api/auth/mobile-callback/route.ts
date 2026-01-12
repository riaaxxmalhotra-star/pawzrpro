import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // Get the session from NextAuth (set by the OAuth flow)
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      // No session - auth failed
      return returnErrorPage('Authentication failed. Please try again.')
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return returnErrorPage('User not found.')
    }

    if (user.suspended) {
      return returnErrorPage('Your account has been suspended.')
    }

    // Generate a one-time login token for mobile app
    const loginToken = crypto.randomBytes(32).toString('hex')
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code: loginToken,
        type: 'MOBILE_LOGIN_TOKEN',
        target: user.email || 'mobile',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    })

    // Redirect to app with login token
    const redirectUrl = `pawzr://auth-success?token=${loginToken}&userId=${user.id}`

    // Return an HTML page that redirects to the custom URL scheme
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Signing in...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(to bottom, #fff7ed, #ffedd5);
            }
            .container { text-align: center; padding: 20px; }
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #fed7aa;
              border-top-color: #ea580c;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h1 { color: #ea580c; font-size: 24px; margin-bottom: 10px; }
            p { color: #78716c; }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background: #ea580c;
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h1>Success!</h1>
            <p>Returning to Pawzr...</p>
            <a href="${redirectUrl}">Open Pawzr</a>
          </div>
          <script>
            window.location.href = "${redirectUrl}";
            setTimeout(function() {
              window.location.href = "${redirectUrl}";
            }, 1000);
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error) {
    console.error('Mobile callback error:', error)
    return returnErrorPage('An error occurred. Please try again.')
  }
}

function returnErrorPage(message: string) {
  const redirectUrl = `pawzr://auth-error?error=${encodeURIComponent(message)}`
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Sign In Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(to bottom, #fef2f2, #fee2e2);
          }
          .container { text-align: center; padding: 20px; }
          h1 { color: #dc2626; font-size: 24px; margin-bottom: 10px; }
          p { color: #78716c; margin-bottom: 20px; }
          a {
            display: inline-block;
            padding: 12px 24px;
            background: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sign In Failed</h1>
          <p>${message}</p>
          <a href="${redirectUrl}">Return to App</a>
        </div>
        <script>
          window.location.href = "${redirectUrl}";
          setTimeout(function() {
            window.location.href = "${redirectUrl}";
          }, 2000);
        </script>
      </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
