import nodemailer from 'nodemailer';

// ─── Transporter ────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // FIX #4: debug dhe logger vetëm në development, jo në production
  debug: process.env.NODE_ENV !== 'production',
  logger: process.env.NODE_ENV !== 'production',
});

// ─── Verify një herë në startup (FIX #3) ────────────────────────────────────

transporter.verify()
  .then(() => console.log('[Mail] Server is ready to take messages'))
  .catch((err) => console.error('[Mail] Connection verify failed:', err));

// ─── Helper: validim email (FIX #6) ─────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Helper: dërgim me retry (OPTIMIZIM #8) ──────────────────────────────────

async function sendWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  retries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error(`[Mail] Attempt ${attempt}/${retries} failed:`, err);
      if (attempt === retries) return false;
      // Backoff eksponencial: 1s, 2s, 3s
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return false;
}

// ─── Welcome Email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<boolean> {
  // FIX #6: validim para dërgimit
  if (!isValidEmail(to)) {
    console.error(`[Mail] Invalid email address: ${to}`);
    return false;
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Urbani Im" <btare99@gmail.com>',
    // FIX #7: replyTo me adresën e support-it
    replyTo: 'support@albroute.al',
    to,
    subject: 'Mirë se erdhe në Urbani Im!',
    // FIX #5: plain-text fallback për clients që bllokojnë HTML
    text: `Përshëndetje ${name}!\n\nJemi të lumtur që u bashkuat me Urbani Im.\n\nÇfarë mund të bëni tani:\n- Shikoni vendndodhjen live të autobusëve\n- Planifikoni rrugën më të shpejtë\n- Ruani stacionet tuaja të preferuara\n- Bleni pajtime online\n\nNëse keni pyetje, na kontaktoni në support@albroute.al\n\n© 2026 Urbani Im`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">

        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 800;">Urbani Im</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Sistemi i Transportit Publik Tiranë</p>
        </div>

        <div style="color: #1e293b; line-height: 1.6;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Përshëndetje ${name}!</h2>

          <!-- FIX #1: zëvendësuam **tekst** me <strong> -->
          <p style="margin-bottom: 16px;">
            Jemi shumë të lumtur që jeni bashkuar me platformën
            <strong>Urbani Im</strong>. Tani mund të ndiqni autobusët
            në kohë reale dhe të planifikoni udhëtimet tuaja në Tiranë
            më lehtë se kurrë.
          </p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 24px 0;">
            <p style="margin: 0; font-weight: 600; color: #334155;">Çfarë mund të bëni tani?</p>
            <ul style="margin: 12px 0 0 0; padding-left: 20px; color: #475569;">
              <li>Shikoni vendndodhjen live të autobusëve</li>
              <li>Planifikoni rrugën më të shpejtë</li>
              <li>Ruani stacionet tuaja të preferuara</li>
              <li>Bleni pajtime online</li>
            </ul>
          </div>

          <p style="margin-bottom: 24px;">
            Nëse keni pyetje apo nevojë për ndihmë, mos hezitoni të na
            kontaktoni në
            <a href="mailto:support@albroute.al" style="color: #2563eb;">support@albroute.al</a>.
          </p>
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Ky është një email automatik nga Urbani Im. © 2026
          </p>
        </div>

      </div>
    `,
  };

  // FIX #3: verify() është hequr nga këtu — bëhet një herë në startup
  const success = await sendWithRetry(mailOptions);
  if (success) {
    console.log(`[Mail] Welcome email sent to: ${to}`);
  }
  return success;
}

// ─── Reset Password Email ─────────────────────────────────────────────────────

export async function sendResetLinkEmail(
  to: string,
  name: string,
  // FIX #2: hoqëm parametrin `token` që nuk përdorej
  resetLink: string
): Promise<boolean> {
  // FIX #6: validim para dërgimit
  if (!isValidEmail(to)) {
    console.error(`[Mail] Invalid email address: ${to}`);
    return false;
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Urbani Im" <btare99@gmail.com>',
    // FIX #7: replyTo me adresën e support-it
    replyTo: 'support@albroute.al',
    to,
    subject: 'Rivendos fjalëkalimin - Urbani Im',
    // FIX #5: plain-text fallback
    text: `Përshëndetje ${name || 'Udhëtar'},\n\nKeni kërkuar rivendosjen e fjalëkalimit.\n\nPërdorni këtë link (i vlefshëm 60 minuta):\n${resetLink}\n\nNëse nuk e keni kërkuar ju, injoroni këtë email.\n\n© 2026 Urbani Im`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">

        <h2 style="color: #2563eb; text-align: center;">Urbani Im</h2>

        <p>Përshëndetje <strong>${name || 'Udhëtar'}</strong>,</p>
        <p>Keni kërkuar rivendosjen e fjalëkalimit. Klikoni butonin më poshtë për të krijuar një fjalëkalim të ri:</p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}"
             style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700;">
            Rivendos fjalëkalimin
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Ky link është i vlefshëm për <strong>60 minuta</strong>.
          Nëse nuk e keni kërkuar ju, injoroni këtë email.
        </p>

        <p style="color: #666; font-size: 14px; word-break: break-all;">
          Nëse butoni nuk funksionon, kopjoni dhe ngjisni këtë lidhje në shfletues:<br/>
          <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; color: #999; font-size: 12px;">
          © 2026 Urbani Im - Tirana Public Transport
        </p>

      </div>
    `,
  };

  const success = await sendWithRetry(mailOptions);
  if (success) {
    console.log(`[Mail] Reset email sent to: ${to}`);
  }
  return success;
}

// ─── Generic Email Function ──────────────────────────────────────────────────

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  // FIX #6: validim pre-send
  if (!isValidEmail(options.to)) {
    console.error(`[Mail] Invalid email address: ${options.to}`);
    return false;
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Urbani Im" <btare99@gmail.com>',
    replyTo: 'support@albroute.al',
    to: options.to,
    subject: options.subject,
    text: options.text || options.html.replace(/<[^>]*>/g, ''),
    html: options.html,
  };

  const success = await sendWithRetry(mailOptions);
  if (success) {
    console.log(`[Mail] Email sent to: ${options.to}`);
  }
  return success;
}

export async function sendEmailVerificationCode(
  to: string,
  name: string,
  verificationCode: string
): Promise<boolean> {
  // FIX #9: validim para dërgimit
  if (!isValidEmail(to)) {
    console.error(`[Mail] Invalid email address: ${to}`);
    return false;
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Urbani Im" <btare99@gmail.com>',
    // FIX #7: replyTo me adresën e support-it
    replyTo: 'support@albroute.al',
    to,
    subject: 'Kodi i Verifikimit - Urbani Im',
    // FIX #5: plain-text fallback
    text: `Përshëndetje ${name || 'Udhëtar'},\n\nMirë se erdhe në Urbani Im!\n\nKodi juaj i verifikimit është: ${verificationCode}\n\nKy kod është i vlefshëm për 15 minuta. Mos e ndajeni me askënd.\n\nNëse nuk e keni kërkuar këtë, injoroni këtë email.\n\n© 2026 Urbani Im`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">

        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 800;">Urbani Im</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Sistemi i Transportit Publik Tiranë</p>
        </div>

        <div style="color: #1e293b; line-height: 1.6;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Mirë se erdhe, ${name || 'Udhëtar'}!</h2>

          <p style="margin-bottom: 16px;">
            Për të përfunduar regjistrimin tuaj, ju lutem shkruani kodin e verifikimit më poshtë në aplikacion:
          </p>

          <div style="background-color: #f0f9ff; padding: 24px; border-radius: 12px; border: 2px solid #2563eb; margin: 24px 0; text-align: center;">
            <p style="margin: 0; color: #475569; font-size: 14px; margin-bottom: 12px;">Kodi juaj i verifikimit:</p>
            <p style="margin: 0; color: #2563eb; font-size: 32px; font-weight: 800; letter-spacing: 4px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </p>
          </div>

          <div style="background-color: #fef3c7; padding: 14px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 16px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Shuarja e kodit:</strong> Ky kod skadon në 15 minuta. Mos e ndajeni me askënd.
            </p>
          </div>

          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Nëse nuk e keni kërkuar këtë, ju lutem injoroni këtë email.
          </p>
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © 2026 Urbani Im - Tirana Public Transport
          </p>
        </div>

      </div>
    `,
  };

  const success = await sendWithRetry(mailOptions);
  if (success) {
    console.log(`[Mail] Verification email sent to: ${to}`);
  }
  return success;
}

// ─── Account Deletion Confirmation Code Email ────────────────────────────────

export async function sendDeletionConfirmationCode(
  to: string,
  name: string,
  confirmationCode: string
): Promise<boolean> {
  // FIX #10: validim para dërgimit
  if (!isValidEmail(to)) {
    console.error(`[Mail] Invalid email address: ${to}`);
    return false;
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from: '"Urbani Im" <btare99@gmail.com>',
    replyTo: 'support@albroute.al',
    to,
    subject: 'Konfirmim Fshirje Llogarie - Urbani Im',
    text: `Përshëndetje ${name || 'Udhëtar'},\n\nKeni kërkuar fshirjen e llogarisë tuaj. Kodi i konfirmimit është: ${confirmationCode}\n\nKy kod është i vlefshëm për 15 minuta.\n\nNëse nuk e keni kërkuar këtë, injoroni këtë email.\n\n© 2026 Urbani Im`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">

        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ef4444; margin: 0; font-size: 28px; font-weight: 800;">Urbani Im</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Konfirmim Fshirje Llogarie</p>
        </div>

        <div style="color: #1e293b; line-height: 1.6;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Fshirja e Llogarisë</h2>

          <p style="margin-bottom: 16px;">
            Përshëndetje ${name || 'Udhëtar'},
          </p>

          <p style="margin-bottom: 16px;">
            Keni kërkuar fshirjen e llogarisë tuaj. Për të konfirmuar këtë veprim, shkruani kodin e mëposhtëm në aplikacion:
          </p>

          <div style="background-color: #fee2e2; padding: 24px; border-radius: 12px; border: 2px solid #ef4444; margin: 24px 0; text-align: center;">
            <p style="margin: 0; color: #7f1d1d; font-size: 14px; margin-bottom: 12px;">Kodi i konfirmimit:</p>
            <p style="margin: 0; color: #ef4444; font-size: 32px; font-weight: 800; letter-spacing: 4px; font-family: 'Courier New', monospace;">
              ${confirmationCode}
            </p>
          </div>

          <div style="background-color: #fef3c7; padding: 14px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 16px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Rëndësi:</strong> Ky kod skadon në 15 minuta. Pas konfirmimit, llogaria juaj do të fshihet brenda 30 ditësh.
            </p>
          </div>

          <p style="margin-top: 24px; color: #666; font-size: 14px;">
            Nëse nuk e keni kërkuar këtë, ju lutem injoroni këtë email. Llogaria juaj do të mbetet e sigurt.
          </p>
        </div>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © 2026 Urbani Im - Tirana Public Transport
          </p>
        </div>

      </div>
    `,
  };

  const success = await sendWithRetry(mailOptions);
  if (success) {
    console.log(`[Mail] Deletion confirmation email sent to: ${to}`);
  }
  return success;
}