import { NextRequest, NextResponse } from 'next/server'

// Return an HTML page that initiates OAuth through NextAuth's proper flow
// This ensures Google sees a legitimate browser request and complies with OAuth 2.0 policy
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://pawzrpro.vercel.app'
  const callbackUrl = `${baseUrl}/api/auth/mobile-callback`

  // Return HTML that fetches CSRF token and auto-submits the signin form
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>Connecting to Google...</h1>
          <p>Please wait...</p>
        </div>
        <form id="signin-form" method="POST" action="${baseUrl}/api/auth/signin/google">
          <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
          <input type="hidden" name="csrfToken" id="csrf-token" value="" />
        </form>
        <script>
          // Fetch CSRF token and submit the form
          fetch('${baseUrl}/api/auth/csrf')
            .then(res => res.json())
            .then(data => {
              document.getElementById('csrf-token').value = data.csrfToken;
              document.getElementById('signin-form').submit();
            })
            .catch(err => {
              console.error('Failed to get CSRF token:', err);
              document.querySelector('h1').textContent = 'Error';
              document.querySelector('p').textContent = 'Failed to connect. Please try again.';
              document.querySelector('.spinner').style.display = 'none';
            });
        </script>
      </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

// Also support POST for backwards compatibility
export async function POST(request: NextRequest) {
  return GET(request)
}
