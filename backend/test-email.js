require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing SMTP Connection...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('Secure:', process.env.SMTP_SECURE);
    console.log('User:', process.env.SMTP_USER);
    // Masquer le mot de passe mais montrer sa longueur
    console.log('Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: 'contact@meereocockpit.com',
            pass: 'hj8J1Vk3oc1?tp!', // Hardcoded for testing
        },
        tls: {
            rejectUnauthorized: false // Often needed for local testing
        },
        authMethod: 'LOGIN', // Force LOGIN instead of PLAIN
        debug: true, // Enable verbose debug output
        logger: true // Log to console
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test SMTP Troh',
            text: 'Si vous recevez ceci, le SMTP fonctionne !',
        });

        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    }
}

testEmail();
