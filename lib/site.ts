// Single source of truth for the public origin. Override per environment
// (e.g. a custom domain later) without touching code.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shoaibqureshi.vercel.app';
