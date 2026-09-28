import { PortfolioExperience } from '@/components/portfolio-experience';
import { getPortfolioContent } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Shoaib Qureshi',
    url: 'https://shoaibqureshi.dev',
    jobTitle: 'Senior Frontend Developer',
    address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressCountry: 'IN' },
    sameAs: ['https://github.com/Shoaib-Qureshi', 'https://www.linkedin.com/in/shoaib-alam-qureshi/'],
    knowsAbout: ['React', 'Next.js', 'Laravel', 'WordPress', 'WooCommerce', 'AI tooling'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shoaib Qureshi - Frontend Developer Portfolio',
    url: 'https://shoaibqureshi.dev',
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
