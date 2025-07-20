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
}

export default new EmailService(); 