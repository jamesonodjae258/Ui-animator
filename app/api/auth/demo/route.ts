/* ── 1-Click Demo / Guest Auth Route ───────────────────────────── */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const DEMO_EMAIL = "demo.creator@uianimator.app";
const DEMO_PASSWORD = "DemoCreator2026!SecureSession";

/**
 * POST /api/auth/demo
 * Creates or signs in a preconfigured demo creator account and sets Supabase session cookies.
 * Enables instant testing of all authenticated routes (import, scene graph, render)
 * without requiring email verification or OAuth.
 */
export async function POST() {
  try {
    const serviceClient = createServiceClient();
    const cookieStore = await cookies();

    // 1. Ensure the demo user exists in auth.users
    let { data: existingUser } = await serviceClient.auth.admin.getUserById(
      "00000000-0000-0000-0000-000000000001",
    );

    if (!existingUser?.user) {
      // Create the demo user with fixed UID or email
      const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Demo Creator", role: "demo" },
      });

      if (createError && !createError.message.includes("already been registered")) {
        console.warn("Could not create fixed demo user:", createError.message);
      }
    }

    // 2. Sign in with standard password to get real JWT & refresh tokens
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let response = NextResponse.json({
      success: true,
      user: { email: DEMO_EMAIL, name: "Demo Creator" },
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

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (signInError) {
      // If password mismatch, try updating demo user password via admin client
      const { data: userList } = await serviceClient.auth.admin.listUsers();
      const demoAccount = userList.users.find((u) => u.email === DEMO_EMAIL);
      if (demoAccount) {
        await serviceClient.auth.admin.updateUserById(demoAccount.id, {
          password: DEMO_PASSWORD,
        });
        await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
      }
    }

    return response;
  } catch (err) {
    console.error("Demo auth error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initialize demo session" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auth/demo
 * Signs out the current session.
 */
export async function DELETE() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.json({ success: true });

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

  await supabase.auth.signOut();
  return response;
}
