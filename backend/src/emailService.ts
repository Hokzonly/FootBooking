import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

interface BookingDetails {
  bookingId: number;
  fieldName: string;
  fieldId: number;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  academyName: string;
}

interface EmailVerificationDetails {
  email: string;
  name: string;
  verificationToken: string;
}

interface PasswordResetDetails {
  email: string;
  name: string;
  resetToken: string;
}

class EmailService {
  private mailerSend: MailerSend;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey) {
      console.warn('MAILERSEND_API_KEY not found in environment variables');
    }
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'booking@test-r9084zvd7mjgw63d.mlsender.net';
    this.fromName = process.env.MAILERSEND_FROM_NAME || 'FootBooking';
    
    this.mailerSend = new MailerSend({ apiKey: apiKey || '' });
  }

  async sendBookingConfirmation(bookingDetails: BookingDetails): Promise<boolean> {
    try {
      const sender = new Sender(this.fromEmail, this.fromName);
      const recipient = new Recipient(bookingDetails.customerEmail, bookingDetails.customerName);

      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo([recipient])
        .setSubject(`🎉 Booking Confirmed - ${bookingDetails.fieldName}`)
        .setHtml(this.generateBookingEmailHTML(bookingDetails))
        .setText(this.generateBookingEmailText(bookingDetails));

      const response = await this.mailerSend.email.send(emailParams);
      return true;
    } catch (error: unknown) {
      console.error('Failed to send email:', error);
      
      const errorObj = error as { body?: { message?: string } };
      if (errorObj.body?.message?.includes('domain must be verified')) {
        console.error('Domain verification error. Please verify your sender domain in MailerSend dashboard.');
        return false;
      }
      
      return false;
    }
  }

  async sendEmailVerification(verificationDetails: EmailVerificationDetails): Promise<boolean> {
    try {
      const sender = new Sender(this.fromEmail, this.fromName);
      const recipient = new Recipient(verificationDetails.email, verificationDetails.name);

      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationDetails.verificationToken}`;

      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo([recipient])
        .setSubject('🔐 Verify Your Email - FootBooking')
        .setHtml(this.generateVerificationEmailHTML(verificationDetails, verificationUrl))
        .setText(this.generateVerificationEmailText(verificationDetails, verificationUrl));

      const response = await this.mailerSend.email.send(emailParams);
      return true;
    } catch (error: unknown) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordReset(resetDetails: PasswordResetDetails): Promise<boolean> {
    try {
      const sender = new Sender(this.fromEmail, this.fromName);
      const recipient = new Recipient(resetDetails.email, resetDetails.name);

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetDetails.resetToken}`;



      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo([recipient])
        .setSubject('🔑 Reset Your Password - FootBooking')
        .setHtml(this.generatePasswordResetEmailHTML(resetDetails, resetUrl))
        .setText(this.generatePasswordResetEmailText(resetDetails, resetUrl));

      const response = await this.mailerSend.email.send(emailParams);
      return true;
    } catch (error: unknown) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  private generateVerificationEmailHTML(verification: EmailVerificationDetails, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .verification-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Email</h1>
            <p>Welcome to FootBooking!</p>
          </div>
          
          <div class="content">
            <div class="verification-box">
              <h2>Hi ${verification.name}!</h2>
              <p>Thank you for signing up with FootBooking. To complete your registration and start booking football fields, please verify your email address.</p>
              
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
              </p>
            </div>
            
            <div class="warning">
              <h3>⚠️ Important</h3>
              <p>You must verify your email before you can book any football fields. This helps us ensure the security of our platform.</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🎯 What happens after verification?</h3>
              <ul>
                <li>You'll be able to book football fields immediately</li>
                <li>Receive booking confirmations via email</li>
                <li>Access your booking history</li>
                <li>Cancel or modify your bookings</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing FootBooking! ⚽</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateVerificationEmailText(verification: EmailVerificationDetails, verificationUrl: string): string {
    return `
🔐 VERIFY YOUR EMAIL - FOOTBOOKING

Hi ${verification.name}!

Thank you for signing up with FootBooking. To complete your registration and start booking football fields, please verify your email address.

VERIFY YOUR EMAIL:
${verificationUrl}

IMPORTANT:
• You must verify your email before you can book any football fields
• This helps us ensure the security of our platform
• After verification, you'll be able to book fields immediately

WHAT HAPPENS AFTER VERIFICATION:
• Book football fields immediately
• Receive booking confirmations via email
• Access your booking history
• Cancel or modify your bookings

Thank you for choosing FootBooking! ⚽

If you didn't create this account, please ignore this email.
    `;
  }

  private generateBookingEmailHTML(booking: BookingDetails): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .success-icon { font-size: 48px; margin-bottom: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Booking Confirmed!</h1>
            <p>Your football field has been successfully reserved</p>
          </div>
          
          <div class="content">
            <div class="booking-details">
              <h2>Booking Details</h2>
              
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">#${booking.bookingId}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Field:</span>
                <span class="value">${booking.fieldName} #${booking.fieldId}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${booking.date}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${booking.time}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Academy:</span>
                <span class="value">${booking.academyName}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Customer:</span>
                <span class="value">${booking.customerName}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${booking.customerPhone}</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Important Information</h3>
              <ul>
                <li>Payment is done in person, not online</li>
                <li>Please arrive 10 minutes before your booking time</li>
                <li>Bring your booking confirmation or QR code</li>
                <li>You can cancel anytime from your account</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173" class="button">Book Another Field</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing FootBooking! ⚽</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateBookingEmailText(booking: BookingDetails): string {
    return `
🎉 BOOKING CONFIRMED!

Your football field has been successfully reserved.

BOOKING DETAILS:
- Booking ID: #${booking.bookingId}
- Field: ${booking.fieldName} #${booking.fieldId}
- Date: ${booking.date}
- Time: ${booking.time}
- Academy: ${booking.academyName}
- Customer: ${booking.customerName}
- Phone: ${booking.customerPhone}

IMPORTANT INFORMATION:
• Payment is done in person, not online
• Please arrive 10 minutes before your booking time
• Bring your booking confirmation or QR code
• You can cancel anytime from your account

Thank you for choosing FootBooking! ⚽

Book another field: http://localhost:5173
    `;
  }

  private generatePasswordResetEmailHTML(reset: PasswordResetDetails, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .security { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Reset Your Password</h1>
            <p>FootBooking Account Security</p>
          </div>
          
          <div class="content">
            <div class="reset-box">
              <h2>Hi ${reset.name}!</h2>
              <p>We received a request to reset your password for your FootBooking account. Click the button below to create a new password.</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
              </p>
            </div>
            
            <div class="warning">
              <h3>⏰ Time Sensitive</h3>
              <p>This password reset link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new link.</p>
            </div>
            
            <div class="security">
              <h3>🔒 Security Notice</h3>
              <p>If you didn't request this password reset, please ignore this email. Your account is secure and no action is needed.</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>💡 Password Tips</h3>
              <ul>
                <li>Use a strong password with at least 8 characters</li>
                <li>Include a mix of letters, numbers, and symbols</li>
                <li>Don't use the same password for multiple accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for using FootBooking! ⚽</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailText(reset: PasswordResetDetails, resetUrl: string): string {
    return `
🔑 RESET YOUR PASSWORD - FOOTBOOKING

Hi ${reset.name}!

We received a request to reset your password for your FootBooking account. Click the link below to create a new password.

RESET PASSWORD:
${resetUrl}

TIME SENSITIVE:
• This password reset link will expire in 1 hour
• If you don't reset your password within this time, you'll need to request a new link

SECURITY NOTICE:
• If you didn't request this password reset, please ignore this email
• Your account is secure and no action is needed

PASSWORD TIPS:
• Use a strong password with at least 8 characters
• Include a mix of letters, numbers, and symbols
• Don't use the same password for multiple accounts
• Consider using a password manager

Thank you for using FootBooking! ⚽

If you have any questions, please contact our support team.
    `;
  }
}

export default new EmailService(); 