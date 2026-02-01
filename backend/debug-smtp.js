require('dotenv').config();
const nodemailer = require('nodemailer');

const configs = [
    {
        name: 'Config 1: Port 465, Secure True (Recommended)',
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: { user: 'contact@meereocockpit.com', pass: 'TrohProjet2026!' }
    },
    {
        name: 'Config 2: Port 587, Secure False',
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false,
        auth: { user: 'contact@meereocockpit.com', pass: 'TrohProjet2026!' }
    },
    {
        name: 'Config 3: Port 587, Secure False, Force LOGIN',
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false,
        auth: { user: 'contact@meereocockpit.com', pass: 'TrohProjet2026!' },
        authMethod: 'LOGIN'
    },
    {
        name: 'Config 4: Port 587, Secure False, LTS RejectUnauthorized False',
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false,
        auth: { user: 'contact@meereocockpit.com', pass: 'TrohProjet2026!' },
        tls: { rejectUnauthorized: false }
    },
    {
        name: 'Config 5: Port 465, Secure True, Minimal',
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: { user: 'contact@meereocockpit.com', pass: 'TrohProjet2026!' },
        tls: { rejectUnauthorized: false }
    }
];

async function testAll() {
    console.log('--- Starting Exhaustive SMTP Test ---');

    for (const config of configs) {
        console.log(`\nTesting ${config.name}...`);
        const transporter = nodemailer.createTransport(config);

        try {
            await transporter.verify();
            console.log(`✅ SUCCESS! ${config.name} works!`);

            // Try sending real email
            await transporter.sendMail({
                from: 'Troh Immo <contact@meereocockpit.com>',
                to: 'contact@meereocockpit.com',
                subject: 'Test Configuration Réussi',
                text: 'Cette configuration fonctionne !'
            });
            console.log('✅ Email sent successfully!');
            return; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED: ${error.message} (Code: ${error.code})`);
            if (error.response) console.log(`   Response: ${error.response}`);
        }
    }

    console.log('\n--- All configurations failed. Definitely blocked. ---');
}

testAll();
