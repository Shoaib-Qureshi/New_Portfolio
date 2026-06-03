import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { sendContactEmail, type ContactMeta } from '@/lib/mailer';
import { getClientIp, lookupGeo, parseUserAgent } from '@/lib/request-meta';

export const runtime = 'nodejs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'portfolio.sqlite');

function ensureTable() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    create table if not exists contacts (
      id integer primary key autoincrement,
      name text not null,
      email text not null,
      message text not null,
      created_at text not null default (datetime('now'))
    );
  `);
  return db;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; message?: string };
    const name = body.name?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const message = body.message?.trim() ?? '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const db = ensureTable();
    db.prepare('insert into contacts (name, email, message) values (?, ?, ?)').run(name, email, message);
    db.close();

    // Gather request metadata for the admin email (date, IP, country, browser, device).
    const ua = req.headers.get('user-agent') ?? '';
    const ip = getClientIp(req.headers);
    const headerCountry = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '';
    const device = parseUserAgent(ua);
    const geo = headerCountry
      ? { country: headerCountry, city: req.headers.get('x-vercel-ip-city') || '' }
      : await lookupGeo(ip);
    const meta: ContactMeta = {
      date: `${new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(new Date())} IST`,
      ip: ip || 'Unknown',
      country: geo.country,
      city: geo.city,
      browser: device.browser,
      os: device.os,
      device: device.device,
    };

    // Best-effort email notification. The message is already saved above, so a
    // mail failure never loses a submission — we just log it and still return ok.
    try {
      const emailed = await sendContactEmail({ name, email, message }, meta);
      if (!emailed) {
        console.warn(
          '[contact] Email NOT sent: mailer not configured. Set GOOGLE_REFRESH_TOKEN in .env.local ' +
            '(run the one-time flow at /api/oauth/google), then restart the dev server.',
        );
      } else {
        console.log('[contact] Notification + acknowledgement emails sent.');
      }
    } catch (mailError) {
      console.error('[contact] Email failed to send:', mailError);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
