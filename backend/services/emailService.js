const nodemailer = require('nodemailer');

// Create a transporter. 
// For dev without SMTP credentials, we will log to console.
// Ideally, we would use 'ethereal' for testing, but console log is enough for "simulated" behavior as requested.
let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('SMTP Config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
        passStart: process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 2) : 'N/A',
        passEnd: process.env.SMTP_PASS ? process.env.SMTP_PASS.slice(-2) : 'N/A'
    });

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        name: 'meereocockpit.com' // Force HELO hostname
    });
} else {
    // Simulator Mode
    console.log('[EmailService] SMTP credentials not found. Using Simulator Mode (Logging to Console).');
    transporter = {
        sendMail: async (mailOptions) => {
            console.log('--- [EMAIL SIMULATION] ---');
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Body (HTML): ${mailOptions.html}`);
            console.log('--------------------------');
            return { messageId: 'simulated-id' };
        }
    };
}

exports.sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Troh Immo" <no-reply@troh.com>',
            to,
            subject,
            html,
        });
        console.log(`[EmailService] Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        throw error;
    }
};
