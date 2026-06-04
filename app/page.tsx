import { PortfolioExperience } from '@/components/portfolio-experience';
import { getPortfolioContent } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const content = await getPortfolioContent();
  return <PortfolioExperience content={content} />;
}
