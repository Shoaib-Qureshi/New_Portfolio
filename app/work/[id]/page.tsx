import type { Metadata } from 'next';
import { CaseStudy } from '@/components/case-study';
import { getPortfolioContent, getProject } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return { title: 'Not found' };
  return {
    title: `${project.title} - Case Study · Shoaib Qureshi`,
    description: project.desc,
    openGraph: {
      title: `${project.title} - Case Study`,
      description: project.desc,
      type: 'article',
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { id } = await params;
  const content = getPortfolioContent();
  const project = content.projects.find((item) => item.id === id) ?? null;
  return <CaseStudy project={project} projects={content.projects} />;
}
