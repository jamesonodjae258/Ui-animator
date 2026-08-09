import { redirect } from "next/navigation";

interface ProjectRootPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectRootPage({ params }: ProjectRootPageProps) {
  const { id } = await params;
  redirect(`/projects/${id}/import`);
}
