import type { Metadata } from 'next';
import { CaseStudy } from '@/components/case-study';
import { getPortfolioContent, getProject } from '@/lib/content-store';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

type RouteParams = { id: string };
type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: 'Not found' };
  return {
    title: `${project.title} - Case Study · Shoaib Qureshi`,
    description: project.desc,
    alternates: { canonical: `/work/${id}` },
    openGraph: {
      title: `${project.title} - Case Study`,
      description: project.desc,
      type: 'article',
      url: `/work/${id}`,
      images: project.image.src ? [{ url: project.image.src, alt: project.image.alt }] : '/opengraph-image',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { id } = await params;
  const content = await getPortfolioContent();
  const project = content.projects.find((item) => item.id === id) ?? null;
  const jsonLd = project && {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    author: { '@type': 'Person', name: 'Shoaib Qureshi' },
    description: project.desc,
    url: `${SITE_URL}/work/${id}`,
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
      <CaseStudy project={project} projects={content.projects} />
    </>
  );
}
