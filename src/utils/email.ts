import nodemailer from 'nodemailer';

type TEmailOptions = {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
};

export const sendEmail = async (options: TEmailOptions) => {
    // 1. Create the transporter using environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for 587/25
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // 2. Generate HTML based on the templateName
    let htmlContent = '';

    if (options.templateName === 'otp') {
        htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
          <h2 style="color: #333;">Hello ${options.templateData.name},</h2>
          <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) for FundingPanda is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0;">${options.templateData.otp}</h1>
          </div>
          <p style="color: #777; font-size: 14px;">This code is valid for 2 minutes. Please do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px;" />
          <p style="color: #999; font-size: 12px; text-align: center;">© 2026 FundingPanda Inc.</p>
      </div>
    `;
    }

    // 3. Define the mail options
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: htmlContent,
    };

    // 4. Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to} [Message ID: ${info.messageId}]`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};