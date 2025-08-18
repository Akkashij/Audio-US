import { NextRequest, NextResponse } from 'next/server';

// Make sure to set GEMINI_API_KEY in your .env.local file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ answer: 'Gemini API key not set.' }, { status: 500 });
  }

  const { context, message } = await req.json();
  const prompt = context ? `${context}\n\n${message}` : message;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      }),
    }
  );

  const data = await geminiRes.json();
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
  return NextResponse.json({ answer });
} 