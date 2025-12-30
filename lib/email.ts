export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    // Dynamic import untuk avoid Turbopack issues dengan CommonJS
    const nodemailer = await import('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Lumina Books" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
}
