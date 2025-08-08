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
        .setSubject(`🎉 Réservation Confirmée - ${bookingDetails.fieldName}`)
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
        .setSubject('🔐 Vérifiez Votre Email - FootBooking')
        .setHtml(this.generateVerificationEmailHTML(verificationDetails, verificationUrl))
        .setText(this.generateVerificationEmailText(verificationDetails, verificationUrl));

      const response = await this.mailerSend.email.send(emailParams);
      return true;
    } catch (error: unknown) {
      console.error('Failed to send verification email:', error);
      
      // Log detailed error information
      if (error && typeof error === 'object') {
        console.error('Email service error details:', {
          error: error,
          apiKey: process.env.MAILERSEND_API_KEY ? 'Set' : 'Not set',
          fromEmail: this.fromEmail,
          fromName: this.fromName,
          recipientEmail: verificationDetails.email
        });
      }
      
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
        .setSubject('🔑 Réinitialisez Votre Mot de Passe - FootBooking')
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
            <h1>🔐 Vérifiez Votre Email</h1>
            <p>Bienvenue sur FootBooking !</p>
          </div>
          
          <div class="content">
            <div class="verification-box">
              <h2>Bonjour ${verification.name} !</h2>
              <p>Merci de vous être inscrit sur FootBooking. Pour compléter votre inscription et commencer à réserver des terrains de football, veuillez vérifier votre adresse email.</p>
              
              <a href="${verificationUrl}" class="button">Vérifier l'Adresse Email</a>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
              </p>
            </div>
            
            <div class="warning">
              <h3>⚠️ Important</h3>
              <p>Vous devez vérifier votre email avant de pouvoir réserver des terrains de football. Cela nous aide à assurer la sécurité de notre plateforme.</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🎯 Que se passe-t-il après la vérification ?</h3>
              <ul>
                <li>Vous pourrez réserver des terrains de football immédiatement</li>
                <li>Recevoir des confirmations de réservation par email</li>
                <li>Accéder à votre historique de réservations</li>
                <li>Annuler ou modifier vos réservations</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Merci d'avoir choisi FootBooking ! ⚽</p>
            <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateVerificationEmailText(verification: EmailVerificationDetails, verificationUrl: string): string {
    return `
🔐 VÉRIFIEZ VOTRE EMAIL - FOOTBOOKING

Bonjour ${verification.name} !

Merci de vous être inscrit sur FootBooking. Pour compléter votre inscription et commencer à réserver des terrains de football, veuillez vérifier votre adresse email.

VÉRIFIEZ VOTRE EMAIL :
${verificationUrl}

IMPORTANT :
• Vous devez vérifier votre email avant de pouvoir réserver des terrains de football
• Cela nous aide à assurer la sécurité de notre plateforme
• Après vérification, vous pourrez réserver des terrains immédiatement

QUE SE PASSE-T-IL APRÈS LA VÉRIFICATION :
• Réserver des terrains de football immédiatement
• Recevoir des confirmations de réservation par email
• Accéder à votre historique de réservations
• Annuler ou modifier vos réservations

Merci d'avoir choisi FootBooking ! ⚽

Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
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
            <h1>Réservation Confirmée !</h1>
            <p>Votre terrain de football a été réservé avec succès</p>
          </div>
          
          <div class="content">
            <div class="booking-details">
              <h2>Détails de la Réservation</h2>
              
              <div class="detail-row">
                <span class="label">ID de Réservation :</span>
                <span class="value">#${booking.bookingId}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Terrain :</span>
                <span class="value">${booking.fieldName} #${booking.fieldId}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Date :</span>
                <span class="value">${booking.date}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Heure :</span>
                <span class="value">${booking.time}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Académie :</span>
                <span class="value">${booking.academyName}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Client :</span>
                <span class="value">${booking.customerName}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Téléphone :</span>
                <span class="value">${booking.customerPhone}</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Informations Importantes</h3>
              <ul>
                <li>Le paiement se fait en personne, pas en ligne</li>
                <li>Veuillez arriver 10 minutes avant l'heure de votre réservation</li>
                <li>Apportez votre confirmation de réservation ou code QR</li>
                <li>Vous pouvez annuler à tout moment depuis votre compte</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="http://localhost:5173" class="button">Réserver un Autre Terrain</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Merci d'avoir choisi FootBooking ! ⚽</p>
            <p>Si vous avez des questions, veuillez contacter notre équipe de support.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateBookingEmailText(booking: BookingDetails): string {
    return `
🎉 RÉSERVATION CONFIRMÉE !

Votre terrain de football a été réservé avec succès.

DÉTAILS DE LA RÉSERVATION :
- ID de Réservation : #${booking.bookingId}
- Terrain : ${booking.fieldName} #${booking.fieldId}
- Date : ${booking.date}
- Heure : ${booking.time}
- Académie : ${booking.academyName}
- Client : ${booking.customerName}
- Téléphone : ${booking.customerPhone}

INFORMATIONS IMPORTANTES :
• Le paiement se fait en personne, pas en ligne
• Veuillez arriver 10 minutes avant l'heure de votre réservation
• Apportez votre confirmation de réservation ou code QR
• Vous pouvez annuler à tout moment depuis votre compte

Merci d'avoir choisi FootBooking ! ⚽

Réserver un autre terrain : http://localhost:5173
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
            <h1>🔑 Réinitialisez Votre Mot de Passe</h1>
            <p>Sécurité du Compte FootBooking</p>
          </div>
          
          <div class="content">
            <div class="reset-box">
              <h2>Bonjour ${reset.name} !</h2>
              <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte FootBooking. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>
              
              <a href="${resetUrl}" class="button">Réinitialiser le Mot de Passe</a>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
              </p>
            </div>
            
            <div class="warning">
              <h3>⏰ Sensible au Temps</h3>
              <p>Ce lien de réinitialisation de mot de passe expirera dans 1 heure pour des raisons de sécurité. Si vous ne réinitialisez pas votre mot de passe dans ce délai, vous devrez demander un nouveau lien.</p>
            </div>
            
            <div class="security">
              <h3>🔒 Avis de Sécurité</h3>
              <p>Si vous n'avez pas demandé cette réinitialisation de mot de passe, veuillez ignorer cet email. Votre compte est sécurisé et aucune action n'est nécessaire.</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>💡 Conseils pour le Mot de Passe</h3>
              <ul>
                <li>Utilisez un mot de passe fort avec au moins 8 caractères</li>
                <li>Incluez un mélange de lettres, chiffres et symboles</li>
                <li>N'utilisez pas le même mot de passe pour plusieurs comptes</li>
                <li>Envisagez d'utiliser un gestionnaire de mots de passe</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Merci d'utiliser FootBooking ! ⚽</p>
            <p>Si vous avez des questions, veuillez contacter notre équipe de support.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmailText(reset: PasswordResetDetails, resetUrl: string): string {
    return `
🔑 RÉINITIALISEZ VOTRE MOT DE PASSE - FOOTBOOKING

Bonjour ${reset.name} !

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte FootBooking. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe.

RÉINITIALISER LE MOT DE PASSE :
${resetUrl}

SENSIBLE AU TEMPS :
• Ce lien de réinitialisation de mot de passe expirera dans 1 heure
• Si vous ne réinitialisez pas votre mot de passe dans ce délai, vous devrez demander un nouveau lien

AVIS DE SÉCURITÉ :
• Si vous n'avez pas demandé cette réinitialisation de mot de passe, veuillez ignorer cet email
• Votre compte est sécurisé et aucune action n'est nécessaire

CONSEILS POUR LE MOT DE PASSE :
• Utilisez un mot de passe fort avec au moins 8 caractères
• Incluez un mélange de lettres, chiffres et symboles
• N'utilisez pas le même mot de passe pour plusieurs comptes
• Envisagez d'utiliser un gestionnaire de mots de passe

Merci d'utiliser FootBooking ! ⚽

Si vous avez des questions, veuillez contacter notre équipe de support.
    `;
  }
}

export default new EmailService(); 