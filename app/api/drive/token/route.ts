export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  console.log("clietId", clientId) 
  console.log("clientSecret", clientSecret)   
  console.log("redirectUri", redirectUri)             

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Google OAuth credentials" },
      { status: 500 }
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const details = await tokenRes.text();
    console.error("Token exchange failed:", details);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 401 }
    );
  }

  const { access_token } = await tokenRes.json();

  return NextResponse.json({ accessToken: access_token });
}

/**
 * 
 * export const runtime = "nodejs"; // Required on Vercel
import { createSupabaseClient } from '@/lib/api-connections/supabase-server';
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    console.log("📥 /api/drive/token HIT");
    console.log("👉 Incoming code:", code);

    const client_id = process.env.GOOGLE_CLIENT_ID!
    const client_secret = process.env.GOOGLE_CLIENT_SECRET!
    const redirect_uri = process.env.REDIRECT_URI!

    console.log("🔐 Using redirect_uri:", redirect_uri);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("❌ Google token API ERROR:", tokenData);
      return NextResponse.json(
        { error: true, detail: tokenData },
        { status: 400 }
      );
    }

  //   return NextResponse.json(data)
  // } catch (err) {
  //   console.error("🔥 Internal error in /api/drive/token:", err);
  //   return NextResponse.json(
  //     { error: true, message: "Server error" },
  //     { status: 500 }
  //   );
  // }


    if (error || !data?.session_id) {
      console.error("🔴 Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to store session" },
        { status: 500 }
      );
    }

    const sessionId = data.session_id;


    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "drive_session_id",
      value: sessionId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", //true then only send cookie over https
      path: "/",
      maxAge: 60 * 60, // 1 hour (matches token lifetime)
    });

    console.log("🍪 Session cookie set:", sessionId);

    return response;
  } catch (err) {
    console.error("🔥 Internal error in /api/drive/token:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

 */
