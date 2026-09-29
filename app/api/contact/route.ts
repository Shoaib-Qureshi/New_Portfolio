import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { sendContactEmail, type ContactMeta } from '@/lib/mailer';
import { getClientIp, lookupGeo, parseUserAgent } from '@/lib/request-meta';

export const runtime = 'nodejs';

// Serverless filesystems are read-only outside /tmp. Writing under process.cwd()
// there throws, which used to fail the whole request. Same rule content-store.ts
// already follows — keep the two in step.
const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME,
);
const DATA_DIR = IS_SERVERLESS ? '/tmp/portfolio-data' : path.join(process.cwd(), 'data');
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
    const body = (await req.json()) as { name?: string; email?: string; message?: string; intent?: string };
    const name = body.name?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const message = body.message?.trim() ?? '';
    // Optional triage hint from the form's select; anything else is dropped.
    const intent = body.intent && ['freelance', 'job', 'other'].includes(body.intent) ? body.intent : undefined;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Best-effort archive. Nothing reads this table today, and on serverless
    // /tmp is wiped between cold starts — so a storage failure must never block
    // the email, which is the actual delivery path.
    let archived = false;
    try {
      const db = ensureTable();
      db.prepare('insert into contacts (name, email, message) values (?, ?, ?)').run(name, email, message);
      db.close();
      archived = true;
    } catch (dbError) {
      console.error('[contact] Archive write failed:', dbError);
    }

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
    let emailed = false;
    try {
      emailed = await sendContactEmail({ name, email, message, intent }, meta);
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

    // The archive is ephemeral on serverless, so only a sent email counts as
    // delivery there. Returning ok when the message reached nobody loses it
    // silently — better the visitor sees the "email me directly" fallback.
    if (!emailed && (IS_SERVERLESS || !archived)) {
      return NextResponse.json({ error: 'Could not deliver message' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact] Request failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
