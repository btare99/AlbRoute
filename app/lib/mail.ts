import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendWelcomeEmail(to: string, name: string) {
  const mailOptions = {
    from: `"Urbani Im" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mirë se erdhe në Urbani Im! 🚌',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 800;">Urbani Im</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Sistemi i Transportit Publik Tiranë</p>
        </div>
        
        <div style="color: #1e293b; line-height: 1.6;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Përshëndetje ${name}! 👋</h2>
          <p style="margin-bottom: 16px;">Jemi shumë të lumtur që jeni bashkuar me platformën **Urbani Im**. Tani mund të ndiqni autobusët në kohë reale dhe të planifikoni udhëtimet tuaja në Tiranë më lehtë se kurrë.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 24px 0;">
            <p style="margin: 0; font-weight: 600; color: #334155;">Çfarë mund të bëni tani?</p>
            <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569;">
              <li>Shikoni vendndodhjen live të autobusëve</li>
              <li>Planifikoni rrugën më të shpejtë</li>
              <li>Ruani stacionet tuaja të preferuara</li>
              <li>Bleni pajtime online</li>
            </ul>
          </div>
          
          <p style="margin-bottom: 24px;">Nëse keni pyetje apo nevojë për ndihmë, mos hezitoni të na kontaktoni duke iu përgjigjur këtij emaili.</p>
        </div>
        
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Ky është një email automatik nga Urbani Im. © 2026</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mail] Welcome email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error('[Mail] Error sending welcome email:', error);
    return false;
  }
}

export async function sendResetCodeEmail(to: string, name: string, code: string) {
  const mailOptions = {
    from: `"Urbani Im" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Kodi i Rivendosjes së Fjalëkalimit - Urbani Im',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Urbani Im</h2>
        <p>Përshëndetje <strong>${name}</strong>,</p>
        <p>Keni kërkuar rivendosjen e fjalëkalimit. Përdorni kodin e mëposhtëm për të vazhduar:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #111; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">Ky kod është i vlefshëm për 10 minuta. Nëse nuk e keni kërkuar ju këtë, ju lutem injoroni këtë email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Urbani Im - Tirana Public Transport</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[Mail] Error sending reset code:', error);
    return false;
  }
}
