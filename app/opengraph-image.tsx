import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/site';

export const alt = 'Shoaib Qureshi - Frontend Developer Portfolio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 80, background: '#06080d', color: 'white' }}>
        <div style={{ fontSize: 120, fontWeight: 300, letterSpacing: -6, lineHeight: 0.95 }}>Shoaib Qureshi.</div>
        <div style={{ marginTop: 32, fontSize: 36, opacity: 0.6 }}>Senior Frontend Developer · React · WordPress · AI tooling</div>
        <div style={{ marginTop: 16, fontSize: 28, opacity: 0.4 }}>{new URL(SITE_URL).host}</div>
      </div>
    ),
    size,
  );
}
