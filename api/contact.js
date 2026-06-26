// Vercel serverless function — sends the contact form to the owner + a confirmation to the sender.
// Requires env vars: EMAIL_USER (your Gmail), EMAIL_PASS (Gmail App Password), optionally SITE_URL.
const nodemailer = require('nodemailer');

// escape user input so it can't inject HTML into the emails
function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const BRAND = '#d4af37';     // gold accent (matches your email design)
const OWNER_NAME = 'Sayantan Dhara';

// shared email shell
function shell(innerHtml) {
  return `
  <div style="background:#f4f4f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 26px rgba(0,0,0,.10);">
      <div style="background:#111111;padding:34px 20px;text-align:center;border-bottom:3px solid ${BRAND};">
        <div style="color:${BRAND};font-size:26px;font-weight:800;letter-spacing:1px;">${OWNER_NAME}</div>
      </div>
      ${innerHtml}
      <div style="padding:18px;text-align:center;color:#9aa;font-size:12px;border-top:1px solid #eee;">
        © 2026 ${OWNER_NAME} · Kolkata, India
      </div>
    </div>
  </div>`;
}

// confirmation email sent TO the visitor
function confirmationHtml(name, siteUrl) {
  return shell(`
    <div style="padding:38px 32px;text-align:center;color:#444;">
      <h1 style="color:${BRAND};font-size:24px;margin:0 0 22px;">Thank You for Reaching Out!</h1>
      <p style="margin:0 0 18px;font-size:15px;">Dear ${esc(name)},</p>
      <p style="margin:0 0 18px;line-height:1.7;font-size:15px;">
        I have received your project details and information. I'm reviewing your requirements, and I will
        get back to you as soon as possible (usually within <strong>24 hours</strong>).
      </p>
      <p style="margin:0 0 30px;line-height:1.7;font-size:15px;">
        I look forward to collaborating with you and bringing your vision to life.
      </p>
      <a href="${siteUrl}" style="display:inline-block;background:${BRAND};color:#111;text-decoration:none;
        font-weight:700;padding:14px 36px;border-radius:6px;letter-spacing:1px;font-size:14px;">VISIT MY WEBSITE</a>
    </div>`);
}

// notification email sent TO you (the owner)
function notificationHtml(name, email, phone, message) {
  const row = (label, val) => `
    <tr>
      <td style="padding:12px 0;color:#999;width:110px;vertical-align:top;font-size:13px;">${label}</td>
      <td style="padding:12px 0;color:#111;font-weight:600;font-size:14px;line-height:1.6;">${val}</td>
    </tr>`;
  return shell(`
    <div style="padding:36px 32px;color:#444;">
      <h1 style="color:${BRAND};font-size:22px;margin:0 0 6px;text-align:center;">New Contact Message</h1>
      <p style="text-align:center;color:#888;font-size:13px;margin:0 0 24px;">Someone reached out through your portfolio.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name', esc(name))}
        ${row('Email', `<a href="mailto:${esc(email)}" style="color:${BRAND};text-decoration:none;">${esc(email)}</a>`)}
        ${row('Phone', phone ? esc(phone) : '—')}
        ${row('Message', esc(message).replace(/\n/g, '<br>'))}
      </table>
    </div>`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name, email, phone, message, company } = body;

    // honeypot — bots fill hidden "company" field; pretend success
    if (company) return res.status(200).json({ ok: true });

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill in your name, email and message.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const OWNER = process.env.EMAIL_USER;
    const PASS  = process.env.EMAIL_PASS;
    const SITE  = process.env.SITE_URL || 'https://github.com/Sayantanraj';
    if (!OWNER || !PASS) {
      return res.status(500).json({ error: 'Email is not configured on the server.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: OWNER, pass: PASS }
    });

    // 1) notify the owner (you) — with the details
    await transporter.sendMail({
      from: `"Portfolio Contact" <${OWNER}>`,
      to: OWNER,
      replyTo: `"${name}" <${email}>`,
      subject: `New message from ${name}`,
      text:
`New contact message from your portfolio:

Name:  ${name}
Email: ${email}
Phone: ${phone || '—'}

Message:
${message}`,
      html: notificationHtml(name, email, phone, message)
    });

    // 2) confirmation to the visitor — from your address.
    //    text part + headers below help it land in the Primary inbox, not spam.
    await transporter.sendMail({
      from: `"${OWNER_NAME}" <${OWNER}>`,
      to: email,
      replyTo: OWNER,
      subject: `Thank you for reaching out, ${name}`,
      text:
`Dear ${name},

I have received your project details and information. I'm reviewing your requirements,
and I will get back to you as soon as possible (usually within 24 hours).

I look forward to collaborating with you and bringing your vision to life.

Visit my website: ${SITE}

— ${OWNER_NAME}, Kolkata, India`,
      html: confirmationHtml(name, SITE),
      headers: {
        'List-Unsubscribe': `<mailto:${OWNER}?subject=unsubscribe>`,
        'X-Entity-Ref-ID': 'portfolio-contact-confirmation'
      }
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact error:', err);
    return res.status(500).json({ error: 'Failed to send. Please try again later.' });
  }
};
