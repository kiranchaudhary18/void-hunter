import nodemailer from 'nodemailer';

/**
 * Creates and configures Nodemailer transporter.
 * Supports production Gmail SMTP or dev fallback.
 */
const createTransporter = async () => {
  const user = (process.env.EMAIL_HOST_USER || process.env.SMTP_USER || '').trim();
  const rawPass = process.env.EMAIL_HOST_PASSWORD || process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/["'\s]/g, '');
  const host = (process.env.SMTP_HOST || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (user && pass) {
    let transporter;
    if (host && host !== 'smtp.gmail.com') {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass
        }
      });
    }

    return {
      transporter,
      user,
      isProduction: true
    };
  }

  // Development fallback via Ethereal test account
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    return {
      transporter: testTransporter,
      user: testAccount.user,
      isProduction: false,
      isEthereal: true
    };
  } catch (err) {
    console.warn('Ethereal test account unavailable, using console fallback:', err.message);
    return {
      transporter: null,
      user: 'no-reply@voidhunter.com',
      isProduction: false,
      isEthereal: false
    };
  }
};

/**
 * Generate Clean Cyberpunk HTML Email Template for Password Reset
 */
const generateResetEmailHtml = ({ pilotName, resetUrl }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Void Hunter - Password Reset</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #050a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #eaf1ff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #0b1230; border: 1px solid #00e5ff; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: #080e28; padding: 26px 20px; text-align: center; border-bottom: 2px solid #00e5ff;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 3px; color: #00e5ff; font-weight: 800;">VOID HUNTER</h1>
              <div style="font-size: 11px; letter-spacing: 2px; color: #94a3b8; margin-top: 5px;">PILOT SECURITY DIRECTIVE</div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px 24px;">
              <h2 style="font-size: 18px; color: #ffffff; margin-top: 0; margin-bottom: 14px;">Greetings Commander ${pilotName ? pilotName : 'Pilot'},</h2>
              <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your <strong>VOID HUNTER</strong> game account.
              </p>
              <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 26px;">
                Please click the button below to reconfigure your password:
              </p>
              <!-- Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: #00e5ff; color: #050a1a; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 6px; letter-spacing: 1px;">
                      RESET YOUR PASSWORD
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 26px; padding: 12px 14px; background: rgba(0, 229, 255, 0.08); border-left: 3px solid #00e5ff; font-size: 12px; color: #94a3b8; border-radius: 4px;">
                <strong>Security Notice:</strong> This password reset link is valid for <strong>30 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
              </div>
              <p style="margin-top: 24px; font-size: 11px; color: #64748b; line-height: 1.5; word-break: break-all;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #00e5ff;" target="_blank">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background: #05091e; padding: 16px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              &copy; 2026 VOID HUNTER. Automated security transmission.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * Dispatch Password Reset Email
 */
export const sendPasswordResetEmail = async ({ to, pilotName, resetUrl, resetToken }) => {
  const { transporter, user, isProduction, isEthereal } = await createTransporter();
  const fromAddress = `"VOID HUNTER" <${user || 'kiran.chaudhary.cg@gmail.com'}>`;
  const subject = 'Password Reset Request - VOID HUNTER';
  const html = generateResetEmailHtml({ pilotName, resetUrl });

  console.log('----------------------------------------------------');
  console.log(`[EMAIL DISPATCH] Target: ${to} (Pilot: ${pilotName})`);
  console.log(`[FROM] ${fromAddress}`);
  console.log(`[RESET LINK] ${resetUrl}`);
  console.log('----------------------------------------------------');

  if (!transporter) {
    return {
      success: true,
      messageId: `sim-${Date.now()}`,
      previewUrl: resetUrl,
      isSimulated: true
    };
  }

  const mailOptions = {
    from: fromAddress,
    to,
    subject,
    html,
    text: `Greetings Commander ${pilotName},\n\nWe received a request to reset your password for your VOID HUNTER account.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 30 minutes.\n\nVOID HUNTER Support`
  };

  const info = await transporter.sendMail(mailOptions);
  let previewUrl = null;

  if (isEthereal) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[ETHEREAL PREVIEW] ${previewUrl}`);
  }

  console.log(`[EMAIL SENT CONFIRMATION] ${info.response || info.messageId}`);

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || resetUrl,
    isProduction
  };
};

export default {
  sendPasswordResetEmail
};
