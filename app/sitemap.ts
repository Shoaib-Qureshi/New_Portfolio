import type { MetadataRoute } from 'next';
import { getPortfolioContent } from '@/lib/content-store';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, siteSettings } = await getPortfolioContent();
  return [
    { url: SITE_URL, priority: 1 },
    ...projects
      .filter((p) => !siteSettings.hiddenProjects.includes(p.id))
      .map((p) => ({ url: `${SITE_URL}/work/${p.id}`, priority: 0.8 })),
  ];
}
