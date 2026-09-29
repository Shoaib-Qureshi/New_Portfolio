import { PortfolioExperience } from '@/components/portfolio-experience';
import { getPortfolioContent } from '@/lib/content-store';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shoaib Qureshi',
    url: SITE_URL,
    jobTitle: 'Senior Frontend Developer',
    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
    sameAs: ['https://github.com/Shoaib-Qureshi', 'https://www.linkedin.com/in/shoaib-alam-qureshi/'],
    knowsAbout: ['React', 'Next.js', 'Laravel', 'WordPress', 'WooCommerce', 'AI tooling'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shoaib Qureshi - Frontend Developer Portfolio',
    url: SITE_URL,
  },
];

export default async function Page() {
  const content = await getPortfolioContent();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PortfolioExperience content={content} />
    </>
  );
}
