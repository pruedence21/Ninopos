import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
    to: string;
    tenantName: string;
    inviterName: string;
    role: string;
    acceptUrl: string;
}

export async function sendInvitationEmail({
    to,
    tenantName,
    inviterName,
    role,
    acceptUrl,
}: SendInvitationEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
            to,
            subject: `You've been invited to join ${tenantName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Team Invitation</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi,</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> as a <strong>${role}</strong>.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${acceptUrl}" 
                   style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This invitation will expire in 7 days.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${acceptUrl}" style="color: #667eea; word-break: break-all;">${acceptUrl}</a>
              </p>
            </div>
          </body>
        </html>
      `,
        });

        if (error) {
            console.error('Email send error:', error);
            throw new Error('Failed to send invitation email');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
}
