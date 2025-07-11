const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        pool: true,
        maxMessages: Infinity,
        maxConnections: 500,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `NEW BORN TRACKING SYSTEM <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #b3e0ff; padding: 25px; text-align: center;">
                    <h1 style="color: #004d99; margin: 0; font-size: 28px;">Newborn Tracking System</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0;">Hi there!</h2>
                    <p style="font-size: 16px; margin-bottom: 20px;">${options.text}</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px; background-color: #f5f5f5; border-bottom: 1px solid #ddd; font-weight: bold;">Subject of Message:</td>
                            <td style="padding: 10px; background-color: #f5f5f5; border-bottom: 1px solid #ddd;">${options.subject}</td>
                        </tr>
                        </table>
                    <p style="font-size: 16px; margin-top: 25px;">For more information or assistance, please visit our website or contact support.</p>
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="https://web-based-newborn-tracking-system.onrender.com/parent-dashboard" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">Visit Our Site</a>
                    </p>
                </div>
                <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 13px; color: #777;">
                    <p style="margin: 0;">This is an automated message from the Newborn Tracking System. Please do not reply.</p>
                    <p style="margin: 5px 0 0;">&copy; 2025 Newborn Tracking System. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('There was an error sending the email');
    }
};

module.exports = sendEmail;