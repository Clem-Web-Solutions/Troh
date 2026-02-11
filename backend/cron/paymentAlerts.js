const cron = require('node-cron');
const { Transaction, Project, User } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/emailService');

const initPaymentAlerts = () => {
    console.log('Initializing Payment Alerts Cron Job...');

    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('Running Payment Alerts Check...');
        try {
            const today = new Date();
            const future30 = new Date(today); future30.setDate(today.getDate() + 30);
            const future7 = new Date(today); future7.setDate(today.getDate() + 7);

            // Find Transactions (Fund Calls) that are pending
            const pendingInvoices = await Transaction.findAll({
                where: {
                    type: 'Invoice',
                    status: 'Pending',
                    dueDate: { [Op.ne]: null }
                },
                include: [{
                    model: Project,
                    as: 'project',
                    include: [{ model: User, as: 'client' }] // Assuming Project has client alias
                }]
            });

            for (const invoice of pendingInvoices) {
                if (!invoice.project || !invoice.project.client || !invoice.project.client.email) continue;

                const dueDate = new Date(invoice.dueDate);
                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let subject = null;
                let message = null;

                if (diffDays === 30) {
                    subject = `Rappel : Appel de fonds - ${invoice.description}`;
                    message = `Bonjour ${invoice.project.client.name},<br><br>Ceci est un rappel pour l'appel de fonds "${invoice.description}" de ${invoice.amount}€, prévu pour le ${dueDate.toLocaleDateString()}.`;
                } else if (diffDays === 7) {
                    subject = `Relance : Appel de fonds proche - ${invoice.description}`;
                    message = `Bonjour,<br><br>L'échéance de votre appel de fonds "${invoice.description}" est dans une semaine (${dueDate.toLocaleDateString()}). Merci de prévoir le règlement de ${invoice.amount}€.`;
                } else if (diffDays === 0) {
                    subject = `URGENT : Appel de fonds à régler aujourd'hui`;
                    message = `Bonjour,<br><br>Votre appel de fonds "${invoice.description}" arrive à échéance aujourd'hui. Merci de procéder au règlement de ${invoice.amount}€.`;
                }

                if (subject && message) {
                    await sendEmail(invoice.project.client.email, subject, message);
                    console.log(`Alert sent for Invoice ${invoice.id} to ${invoice.project.client.email}`);
                }
            }
        } catch (error) {
            console.error('Error in Payment Alerts Cron:', error);
        }
    });
};

module.exports = initPaymentAlerts;
