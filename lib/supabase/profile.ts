import { createClient } from "./server";
import type { ProfileRow } from "./types";

export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email?: string } | null;
  profile: ProfileRow | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, profile: null };
    }

    // Attempt to query profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile && !profileError) {
      return { user, profile };
    }

    // Upsert fallback if trigger did not fire or record does not exist
    const fallbackProfile: ProfileRow = {
      id: user.id,
      email: user.email ?? null,
      name:
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from("profiles").upsert({
      id: fallbackProfile.id,
      email: fallbackProfile.email,
      name: fallbackProfile.name,
    });

    return { user, profile: fallbackProfile };
  } catch (err) {
    console.warn("Could not fetch user profile:", err);
    return { user: null, profile: null };
  }
}
