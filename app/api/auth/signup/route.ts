import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/signup
 * Creates a new user with email_confirm: true (no confirmation email sent).
 * Instantly logs the user in and establishes cookies so they are taken directly to /projects.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const name = body.name?.trim() || "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const cookieStore = await cookies();

    // 1. Create user with email_confirm: true so no email is sent and no confirmation needed
    const { data: userData, error: createError } =
      await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          full_name: name,
        },
      });

    if (createError) {
      const msg = createError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. Ensure profile entry exists
    if (userData.user) {
      try {
        await serviceClient
          .from("profiles")
          .upsert({
            id: userData.user.id,
            email,
            full_name: name || null,
            updated_at: new Date().toISOString(),
          });
      } catch (profileErr) {
        console.warn("Profiles upsert warning:", profileErr);
      }
    }

    // 3. Immediately sign in to establish real session cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let response = NextResponse.json({
      success: true,
      user: userData.user,
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      return NextResponse.json({
        success: true,
        user: userData.user,
      });
    }

    return response;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create account" },
      { status: 500 }
    );
  }
}
