import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendMagicLinkEmail(email: string, magicLinkUrl: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail || 'Content Calendar <hello@contentcalendarforhairpros.com>',
      to: email,
      subject: 'Your Magic Login Link - Content Calendar for Hair Pros',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFF8F0; padding: 40px 20px; margin: 0;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #5D4E3C; font-size: 24px; margin: 0 0 8px;">Content Calendar</h1>
              <p style="color: #8B7355; font-size: 14px; margin: 0;">for Hair Extension Professionals</p>
            </div>
            
            <h2 style="color: #5D4E3C; font-size: 20px; text-align: center; margin-bottom: 16px;">
              Your magic link is ready!
            </h2>
            
            <p style="color: #5D4E3C; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
              Click the button below to sign in to your account. This link will expire in 15 minutes.
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${magicLinkUrl}" style="display: inline-block; background-color: #D4A574; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Sign In to Content Calendar
              </a>
            </div>
            
            <p style="color: #8B7355; font-size: 14px; text-align: center; margin-bottom: 16px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #D4A574; font-size: 12px; word-break: break-all; text-align: center; background: #FFF8F0; padding: 12px; border-radius: 6px;">
              ${magicLinkUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #F5EDE4; margin: 32px 0;">
            
            <p style="color: #8B7355; font-size: 12px; text-align: center;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
}
