import 'server-only';

import nodemailer from 'nodemailer';

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type ContactMeta = {
  date: string;
  ip: string;
  country: string;
  city?: string;
  browser: string;
  os: string;
  device: string;
};

export function isMailerConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.GMAIL_USER,
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER as string,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// ── Palette (warm, premium, light canvas — reads well on Gmail white) ──
const C = {
  canvas: '#FAFAF9', // warm off-white outer
  card: '#FFFFFF',
  cardBorder: '#EBE9E6',
  headerBg: '#0B0D12', // cinematic dark brand band
  ink: '#0C0A09', // headings
  body: '#44403C', // body text (>4.5:1 on white)
  muted: '#78716C', // labels
  faint: '#A8A29E', // footer / accent dot
  quoteBg: '#F6F5F3',
  rule: '#EBE9E6',
  metaRule: '#EFEDEA',
};

/** Light, premium email shell with a dark brand header band. Table-based for client support. */
function shell(inner: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:${C.canvas};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas};">
    <tr><td align="center" style="padding:36px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border:1px solid ${C.cardBorder};border-radius:18px;overflow:hidden;box-shadow:0 14px 44px rgba(12,10,9,0.10);">
        <tr><td style="background:${C.headerBg};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:3px;line-height:0;font-size:0;background-color:rgba(255,255,255,0.30);background-image:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.6) 50%,rgba(255,255,255,0) 100%);">&nbsp;</td></tr>
            <tr><td style="padding:26px 38px;font-family:${FONT};">
              <div style="font-size:15px;letter-spacing:3px;text-transform:uppercase;color:#ffffff;font-weight:600;">Shoaib Qureshi</div>
              <div style="margin-top:6px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Senior Frontend Developer</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:36px 38px 38px;font-family:${FONT};">${inner}</td></tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="padding:18px 10px 0;text-align:center;font-family:${FONT};font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${C.faint};">
          Bengaluru, India &middot; Sent from the portfolio contact form
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function label(text: string) {
  return `<p style="margin:0 0 10px;font-family:${FONT};font-size:10px;letter-spacing:1.8px;text-transform:uppercase;color:${C.muted};">${text}</p>`;
}

function quoteBox(messageHtml: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-left:2px solid ${C.ink};background:${C.quoteBg};padding:16px 18px;border-radius:0 10px 10px 0;font-family:${FONT};font-size:14px;line-height:1.7;color:#292524;">${messageHtml}</td></tr></table>`;
}

function metaRow(name: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.metaRule};font-family:${FONT};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};white-space:nowrap;">${name}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${C.metaRule};font-family:${FONT};font-size:13px;color:#1C1917;text-align:right;">${value}</td>
  </tr>`;
}

/**
 * Sends two emails for a contact-form submission via the Gmail account in
 * GMAIL_USER (OAuth2): an admin notification to CONTACT_TO (with request
 * metadata), and a styled acknowledgement back to the submitter. Returns true
 * if the admin notification was sent. The admin mail is prioritised — a failure
 * to send the acknowledgement is logged but does not fail the call.
 */
export async function sendContactEmail(payload: ContactPayload, meta?: ContactMeta): Promise<boolean> {
  if (!isMailerConfigured()) return false;

  const user = process.env.GMAIL_USER as string;
  const adminTo = process.env.CONTACT_TO || user;
  const transporter = buildTransporter();

  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const firstName = escapeHtml(payload.name.trim().split(/\s+/)[0] || 'there');
  const messageHtml = escapeHtml(payload.message).replace(/\r?\n/g, '<br>');

  // ── 1) Admin notification — enquiry + request metadata ──────────────
  const location = meta
    ? meta.city
      ? `${escapeHtml(meta.city)}, ${escapeHtml(meta.country)}`
      : escapeHtml(meta.country)
    : '';
  const metaTable = meta
    ? `<div style="margin-top:30px;">${label('Request details')}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
         ${metaRow('Date', escapeHtml(meta.date))}
         ${metaRow('IP address', escapeHtml(meta.ip))}
         ${metaRow('Location', location)}
         ${metaRow('Browser', escapeHtml(meta.browser))}
         ${metaRow('Device', `${escapeHtml(meta.device)} &middot; ${escapeHtml(meta.os)}`)}
       </table></div>`
    : '';

  const adminInner = `
    ${label('New enquiry')}
    <h1 style="margin:0 0 6px;font-family:${FONT};font-size:27px;font-weight:300;letter-spacing:-0.5px;color:${C.ink};">${name}</h1>
    <p style="margin:0 0 28px;font-family:${FONT};font-size:14px;">
      <a href="mailto:${email}" style="color:#1C1917;text-decoration:none;border-bottom:1px solid #D6D3D1;">${email}</a>
    </p>
    ${label('Message')}
    ${quoteBox(messageHtml)}
    ${metaTable}`;

  const adminText =
    `New enquiry\n\nName: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}\n\n` +
    (meta
      ? `— Request details —\nDate: ${meta.date}\nIP: ${meta.ip}\nLocation: ${meta.city ? meta.city + ', ' : ''}${meta.country}\nBrowser: ${meta.browser}\nDevice: ${meta.device} (${meta.os})\n`
      : '');

  await transporter.sendMail({
    from: `Portfolio Contact <${user}>`,
    to: adminTo,
    replyTo: `${payload.name} <${payload.email}>`,
    subject: `New portfolio enquiry from ${payload.name}`,
    text: adminText,
    html: shell(adminInner),
  });

  // ── 2) User acknowledgement — styled auto-reply ─────────────────────
  const userInner = `
    <h1 style="margin:0 0 18px;font-family:${FONT};font-size:30px;font-weight:300;letter-spacing:-1px;color:${C.ink};">Thanks, ${firstName}<span style="color:${C.faint};">.</span></h1>
    <p style="margin:0 0 26px;font-family:${FONT};font-size:15px;line-height:1.75;color:${C.body};">
      Your message just landed in my inbox. I'll get back to you within <span style="color:${C.ink};font-weight:600;">24 hours</span> with next steps — good things take a little craft.
    </p>
    ${label('What you sent')}
    ${quoteBox(messageHtml)}
    <div style="margin-top:30px;padding-top:24px;border-top:1px solid ${C.rule};">
      <p style="margin:0;font-family:${FONT};font-size:15px;color:${C.ink};font-weight:600;">Shoaib Qureshi</p>
      <p style="margin:5px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};">Senior Frontend Developer &middot; Bengaluru, India</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: `Shoaib Qureshi <${user}>`,
      to: payload.email,
      replyTo: user,
      subject: "Thanks for reaching out — I've got your message",
      text:
        `Hi ${payload.name.trim().split(/\s+/)[0] || 'there'},\n\n` +
        `Your message just landed in my inbox. I'll get back to you within 24 hours with next steps.\n\n` +
        `For reference, here's what you sent:\n\n${payload.message}\n\n` +
        `— Shoaib Qureshi\nSenior Frontend Developer, Bengaluru`,
      html: shell(userInner),
    });
  } catch (ackError) {
    console.error('[contact] Acknowledgement email failed to send:', ackError);
  }

  return true;
}
