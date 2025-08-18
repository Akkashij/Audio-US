import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/v1/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!backendResponse.ok) {
      throw new Error('Backend request failed');
    }

    const data = await backendResponse.json();
    
    // Set cookies
    const response = NextResponse.redirect(new URL('/redirect-temp', request.url));
    
    // Set JWT cookie
    response.cookies.set('jwt', data.token, {
      httpOnly: false, // Set to false to allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800, // 7 days
      path: '/'
    });

    // Set userId and meetingId cookies
    if (data.userId) {
      response.cookies.set('userId', data.userId, {
        httpOnly: false, // Set to false to allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800, // 7 days
        path: '/'
      });
    }
    if (data.meetingId) {
      response.cookies.set('meetingId', data.meetingId, {
        httpOnly: false, // Set to false to allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800, // 7 days
        path: '/'
      });
    }

    return response;
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
