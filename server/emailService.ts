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

export async function sendMagicLinkEmail(email: string, magicLinkUrl: string, verificationCode?: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const codeSection = verificationCode ? `
            <div style="background: #FFF8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="color: #8B7355; font-size: 14px; margin: 0 0 8px;">Your verification code for the mobile app:</p>
              <p style="color: #D4A574; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">${verificationCode}</p>
            </div>
    ` : '';
    
    await client.emails.send({
      from: fromEmail || 'Content Calendar <hello@contentcalendarforhairpros.com>',
      to: email,
      subject: verificationCode 
        ? `Your Code: ${verificationCode} - Content Calendar for Hair Pros`
        : 'Your Magic Login Link - Content Calendar for Hair Pros',
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
              <p style="color: #8B7355; font-size: 14px; margin: 0;">for Hair Pros</p>
            </div>
            
            <h2 style="color: #5D4E3C; font-size: 20px; text-align: center; margin-bottom: 16px;">
              ${verificationCode ? 'Your sign-in code is ready!' : 'Your magic link is ready!'}
            </h2>
            
            ${codeSection}
            
            <p style="color: #5D4E3C; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
              ${verificationCode 
                ? 'Enter this code in the app, or click the button below to sign in. This expires in 15 minutes.'
                : 'Click the button below to sign in to your account. This link will expire in 15 minutes.'}
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

export async function sendWelcomeEmail(email: string, password: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    const loginUrl = process.env.REPLIT_DEPLOYMENT === '1'
      ? 'https://contentcalendarforhairpros.com/login'
      : (process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/login`
        : 'https://contentcalendarforhairpros.com/login');
    
    await client.emails.send({
      from: fromEmail || 'Content Calendar <hello@contentcalendarforhairpros.com>',
      to: email,
      subject: 'Welcome to Content Calendar for Hair Pros - Your Account is Ready!',
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
              <p style="color: #8B7355; font-size: 14px; margin: 0;">for Hair Pros</p>
            </div>
            
            <h2 style="color: #5D4E3C; font-size: 20px; text-align: center; margin-bottom: 16px;">
              Welcome! Your account is ready.
            </h2>
            
            <p style="color: #5D4E3C; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
              We're excited to have you! Here are your login credentials:
            </p>
            
            <div style="background: #FFF8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="color: #5D4E3C; font-size: 14px; margin: 0 0 8px;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="color: #5D4E3C; font-size: 14px; margin: 0;">
                <strong>Password:</strong> ${password}
              </p>
            </div>
            
            <p style="color: #8B7355; font-size: 14px; text-align: center; margin-bottom: 24px;">
              We recommend changing your password after your first login for security.
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #D4A574; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Sign In Now
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #F5EDE4; margin: 32px 0;">
            
            <p style="color: #8B7355; font-size: 12px; text-align: center;">
              Monthly content ideas, AI-powered captions, and trend alerts await you!
            </p>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail || 'Content Calendar <hello@contentcalendarforhairpros.com>',
      to,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
