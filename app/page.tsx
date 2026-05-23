import { PortfolioExperience } from '@/components/portfolio-experience';
import { getPortfolioContent } from '@/lib/content-store';

export const dynamic = 'force-dynamic';

export default function Page() {
  const content = getPortfolioContent();
  return <PortfolioExperience content={content} />;
}
