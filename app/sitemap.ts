import type { MetadataRoute } from 'next';
import { getPortfolioContent } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, siteSettings } = await getPortfolioContent();
  const base = 'https://shoaibqureshi.dev';
  return [
    { url: base, priority: 1 },
    ...projects
      .filter((p) => !siteSettings.hiddenProjects.includes(p.id))
      .map((p) => ({ url: `${base}/work/${p.id}`, priority: 0.8 })),
  ];
}
