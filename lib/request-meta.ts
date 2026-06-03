import 'server-only';

export type DeviceInfo = { browser: string; os: string; device: string };
export type GeoInfo = { country: string; city: string };

/** Pulls the client IP from common proxy headers, stripping IPv6-mapped prefixes. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  const raw = xff ? xff.split(',')[0].trim() : headers.get('x-real-ip') || '';
  return raw.replace(/^::ffff:/, '');
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('fc') ||
    ip.startsWith('fd') ||
    ip.startsWith('fe80')
  );
}

/** Lightweight, dependency-free User-Agent parsing. Good enough for an enquiry email. */
export function parseUserAgent(ua: string): DeviceInfo {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };

  let os = 'Unknown';
  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Linux/.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/.test(ua)) browser = 'Samsung Internet';
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Version\/.*Safari/.test(ua)) browser = 'Safari';
  else if (/Chromium/.test(ua)) browser = 'Chromium';

  let device = 'Desktop';
  if (/iPad|Tablet/.test(ua)) device = 'Tablet';
  else if (/Mobi|iPhone|Android.*Mobile/.test(ua)) device = 'Mobile';
  else if (/Android/.test(ua)) device = 'Tablet';

  return { browser, os, device };
}

/** Resolves country/city from IP via ipapi.co. Best-effort: never throws. */
export async function lookupGeo(ip: string): Promise<GeoInfo> {
  if (isPrivateIp(ip)) return { country: 'Local network', city: '' };
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'portfolio-contact/1.0' },
    });
    if (!res.ok) return { country: 'Unknown', city: '' };
    const d = (await res.json()) as { country_name?: string; city?: string; error?: boolean };
    if (d.error) return { country: 'Unknown', city: '' };
    return { country: d.country_name || 'Unknown', city: d.city || '' };
  } catch {
    return { country: 'Unknown', city: '' };
  }
}
