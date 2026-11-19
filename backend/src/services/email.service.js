const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const requiredEnvironment = [
  "EMAIL_USER",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REFRESH_TOKEN",
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: emailUser,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function emailLayout(content) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:32px 12px;background:#101114;color:#f2f2f6;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">Personalized interview preparation starts with UdaanX.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;border:1px solid #303139;border-radius:12px;background:#17181d;">
      <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #303139;">
        <div style="font-size:20px;font-weight:700;letter-spacing:.2px;color:#f5f4fa;">Udaan<span style="color:#a68aff;">X</span></div>
      </td></tr>
      <tr><td style="padding:28px 32px 32px;">${content}</td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid #303139;color:#858792;font-size:12px;line-height:1.6;">
        This is an automated message from UdaanX. If you did not request this, you can safely ignore it.
      </td></tr>
    </table>
  </body>
</html>`;
}

function greeting(username) {
  return escapeHtml(username || "there");
}

async function sendEmail(to, subject, text, html) {
  const missing = requiredEnvironment.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Email service is not configured. Missing environment settings: ${missing.join(", ")}.`);
  }

  return transporter.sendMail({
    from: `"UdaanX" <${emailUser}>`,
    to,
    subject,
    text,
    html,
  });
}

async function sendregistrationemail(username, email, otp) {
  const safeUsername = greeting(username);
  const safeOtp = escapeHtml(otp);
  const text = `Hi ${username || "there"},\n\nYour UdaanX email verification code is ${otp}. It expires in 10 minutes.\n\nIf you did not create a UdaanX account, you can ignore this email.`;
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#aaaab5;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Email verification</p>
    <h1 style="margin:0 0 12px;color:#f3f2f7;font-size:24px;line-height:1.3;">Verify your email</h1>
    <p style="margin:0 0 22px;color:#b1b1bb;font-size:15px;line-height:1.65;">Hi ${safeUsername}, use this code to finish creating your UdaanX account.</p>
    <div style="margin:0 0 20px;padding:17px;border:1px solid #3a3548;border-radius:8px;background:#201d28;color:#c4b2ff;font-size:30px;font-weight:700;letter-spacing:8px;text-align:center;">${safeOtp}</div>
    <p style="margin:0;color:#9697a1;font-size:13px;line-height:1.6;">This code expires in 10 minutes. For your security, do not share it with anyone.</p>
  `);

  return sendEmail(email, "Verify your email | UdaanX", text, html);
}

async function sendloginemail(username, email) {
  const safeUsername = greeting(username);
  const signedInAt = new Date().toUTCString();
  const text = `Hi ${username || "there"},\n\nA successful sign-in to your UdaanX account was detected at ${signedInAt}.\n\nIf this was not you, please secure your account by changing your password.`;
  const html = emailLayout(`
    <p style="margin:0 0 10px;color:#aaaab5;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Account activity</p>
    <h1 style="margin:0 0 12px;color:#f3f2f7;font-size:24px;line-height:1.3;">New sign-in to UdaanX</h1>
    <p style="margin:0 0 18px;color:#b1b1bb;font-size:15px;line-height:1.65;">Hi ${safeUsername}, your account was signed in successfully.</p>
    <div style="padding:14px 16px;border:1px solid #34353d;border-radius:8px;background:#1d1e24;color:#c9c9d1;font-size:14px;line-height:1.6;">
      <strong style="color:#eeeef3;">Time</strong><br>${escapeHtml(signedInAt)}
    </div>
    <p style="margin:18px 0 0;color:#9697a1;font-size:13px;line-height:1.6;">If this was not you, please change your password and contact support.</p>
  `);

  return sendEmail(email, "New sign-in to your UdaanX account", text, html);
}

async function sendotpemail(username, email, otp) {
  return sendregistrationemail(username, email, otp);
}

module.exports = {
  sendregistrationemail,
  sendloginemail,
  sendotpemail,
};
