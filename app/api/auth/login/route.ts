import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/login
 * Signs in user with email & password.
 * Automatically confirms unconfirmed accounts if needed so users are never blocked by confirmation emails.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let response = NextResponse.json({ success: true });

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

    let { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // If unconfirmed email error, automatically confirm via admin and retry
    if (
      signInError &&
      (signInError.message.toLowerCase().includes("not confirmed") ||
        signInError.message.toLowerCase().includes("email not confirmed"))
    ) {
      try {
        const { data: userList } = await serviceClient.auth.admin.listUsers();
        const found = userList?.users?.find(
          (u) => u.email?.toLowerCase() === email
        );
        if (found) {
          await serviceClient.auth.admin.updateUserById(found.id, {
            email_confirm: true,
          });

          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!retry.error) {
            return response;
          }
        }
      } catch (adminErr) {
        console.warn("Auto-confirm attempt failed:", adminErr);
      }
    }

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 401 });
    }

    return response;
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to sign in" },
      { status: 500 }
    );
  }
}
