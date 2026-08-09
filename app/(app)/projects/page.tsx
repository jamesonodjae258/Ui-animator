import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectRow } from "@/lib/supabase/types";

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects: ProjectRow[] = [];

  if (user) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      projects = data as ProjectRow[];
    }
  }

  // Fallback UUID for creating a new project
  const newProjectId = crypto.randomUUID();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Projects</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your Figma motion graphic video projects.
          </p>
        </div>
        <Link href={`/projects/${newProjectId}/import`}>
          <Button variant="primary">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        /* Empty State */
        <Card className="py-16 text-center border-dashed border-border">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            No projects created yet
          </h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto mb-6">
            Connect your Figma prototype to turn screens into narrative motion graphic videos.
          </p>
          <Link href={`/projects/${newProjectId}/import`}>
            <Button variant="primary" size="lg">
              Create your first project
            </Button>
          </Link>
        </Card>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <Link key={proj.id} href={`/projects/${proj.id}/import`}>
              <Card className="hover:border-border-strong transition-colors cursor-pointer space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-text-primary truncate">
                    {proj.name || "Untitled Project"}
                  </h3>
                  <Badge variant="subtle">{proj.duration_seconds}s</Badge>
                </div>
                {proj.brief && (
                  <p className="text-xs text-text-muted line-clamp-2">{proj.brief}</p>
                )}
                <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
                  <span>Updated {new Date(proj.updated_at).toLocaleDateString()}</span>
                  <span className="text-text-secondary hover:text-text-primary font-medium">
                    Open →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
