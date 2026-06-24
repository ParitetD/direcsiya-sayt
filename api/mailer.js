const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

const SUBJECT_LABELS = {
  cooperation: 'Сотрудничество',
  events:      'Мероприятия',
  sports:      'Виды спорта',
  media:       'СМИ и пресса',
  other:       'Другое',
};

async function sendContactNotification({ name, email, subject, message }) {
  const t = getTransporter();
  if (!t) return; // SMTP not configured — silently skip

  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
  const subjectLabel = SUBJECT_LABELS[subject] || subject || 'Без темы';
  const date = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });

  await t.sendMail({
    from: `"Форма обратной связи" <${process.env.SMTP_USER}>`,
    replyTo: `"${name}" <${email}>`,
    to,
    subject: `[Обращение] ${subjectLabel} — ${name}`,
    text: [
      `Новое обращение с сайта ДНВС`,
      ``,
      `От:      ${name}`,
      `Email:   ${email}`,
      `Тема:    ${subjectLabel}`,
      `Дата:    ${date}`,
      ``,
      `Сообщение:`,
      message,
      ``,
      `— Чтобы ответить, просто нажмите «Ответить» в своём почтовом клиенте.`,
    ].join('\n'),
    html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
  <div style="background:#8B2500;padding:20px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">Новое обращение с сайта ДНВС</h2>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:6px 0;color:#64748b;width:80px">От</td><td style="padding:6px 0;font-weight:600">${esc(name)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0"><a href="mailto:${esc(email)}" style="color:#8B2500">${esc(email)}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Тема</td><td style="padding:6px 0">${esc(subjectLabel)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Дата</td><td style="padding:6px 0;color:#64748b;font-size:14px">${esc(date)}</td></tr>
    </table>
    <div style="background:#f8fafc;border-left:3px solid #8B2500;padding:16px;border-radius:0 6px 6px 0;white-space:pre-wrap;font-size:15px;line-height:1.7">${esc(message)}</div>
    <p style="margin-top:20px;font-size:13px;color:#94a3b8">Нажмите «Ответить» — письмо придёт напрямую отправителю.</p>
  </div>
</div>`,
  });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendContactNotification };
