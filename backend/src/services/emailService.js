const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function getResetEmailHtml({ resetUrl, expiryMinutes = 60 }) {
  const logoUrl = `${process.env.APP_URL}/logo.png`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your Vaultix password</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'DM Sans',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <img src="${logoUrl}"
                      width="20" height="20" alt="V"
                      style="display:block;margin:8px auto;" />
                  </td>
                  <td style="padding-left:10px;font-size:18px;font-weight:600;color:#e2e2f0;letter-spacing:-0.3px;vertical-align:middle;">
                    Vaultix
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#111118;border:1px solid #1e1e2e;border-radius:16px;padding:36px 32px;">

              <!-- Icon -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;line-height:44px;">🔐</span>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#e2e2f0;letter-spacing:-0.4px;line-height:1.3;">
                Reset your password
              </h1>

              <!-- Body -->
              <p style="margin:0 0 24px;font-size:14px;color:#6b6b8a;line-height:1.7;">
                We received a request to reset the password for your Vaultix account.
                Click the button below to set a new password. This link expires in
                <strong style="color:#a5a5c0;">${expiryMinutes} minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background-color:#6366f1;border-radius:9px;">
                    <a href="${resetUrl}"
                      style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;font-family:'DM Sans',system-ui,sans-serif;">
                      Reset password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
                <tr>
                  <td style="border-top:1px solid #1e1e2e;"></td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 6px;font-size:12px;color:#4a4a6a;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:11px;color:#6366f1;word-break:break-all;font-family:'JetBrains Mono',monospace,sans-serif;line-height:1.6;">
                ${resetUrl}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#3a3a5a;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.<br/>
                Your password will remain unchanged.
              </p>
              <p style="margin:0;font-size:11px;color:#2a2a42;">
                © ${new Date().getFullYear()} Vaultix · Built with care
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const html = getResetEmailHtml({ resetUrl });

  const { data, error } = await resend.emails.send({
    from: `Vaultix <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Reset your Vaultix password",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send reset email");
  }

  console.log(`Reset email sent → ${to} (id: ${data.id})`);
  return data;
}

module.exports = { sendPasswordResetEmail };
