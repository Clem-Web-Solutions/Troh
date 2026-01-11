const { Finance, Project, Activity, Transaction } = require('../models');

exports.addTransaction = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type, amount, description, status, date } = req.body;

        // Create Transaction Record
        const transaction = await Transaction.create({
            projectId,
            type,
            amount,
            description,
            status: status || 'Pending',
            date: date || new Date()
        });

        // Update Finance Aggregate (Optional, but good for quick access)
        // Recalculate totals
        await exports.updateFinanceAggregates(projectId);

        // Notification / Activity Log
        let activityType = 'INFO';
        let activityDesc = description;

        if (type === 'Invoice') {
            activityType = 'INVOICE_SENT';
            activityDesc = `Nouvel appel de fonds : ${amount}€ (${description})`;
        } else if (type === 'Payment') {
            activityType = 'PAYMENT_RECEIVED';
            activityDesc = `Paiement reçu : ${amount}€`;
        }

        await Activity.create({
            type: activityType,
            description: activityDesc,
            projectId,
            userId: req.user.id
        });

        res.json({ message: 'Transaction ajoutée', transaction });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la transaction' });
    }
};

exports.getFinance = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Ensure Finance record exists (lazy init)
        let finance = await Finance.findOne({ where: { projectId } });
        if (!finance) {
            finance = await Finance.create({ projectId, totalAmount: 0, paidAmount: 0 });
        }

        // Fetch all transactions
        const transactions = await Transaction.findAll({
            where: { projectId },
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

        // Calculate aggregates on the fly to be safe
        const totalPaid = transactions
            .filter(t => t.type === 'Payment' && t.status === 'Completed')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalInvoiced = transactions
            .filter(t => t.type === 'Invoice')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Update cache if needed
        if (parseFloat(finance.paidAmount) !== totalPaid) {
            await finance.update({ paidAmount: totalPaid });
        }

        res.json({
            ...finance.toJSON(),
            transactions, // SQL Transactions
            summary: {
                totalPaid,
                totalInvoiced,
                remaining: finance.totalAmount - totalPaid
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const projectId = transaction.projectId;
        await transaction.destroy();

        await exports.updateFinanceAggregates(projectId);

        res.json({ message: 'Transaction supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
};

exports.updateFinanceAggregates = async (projectId) => {
    try {
        const transactions = await Transaction.findAll({ where: { projectId } });
        const finance = await Finance.findOne({ where: { projectId } });

        if (finance) {
            const totalPaid = transactions
                .filter(t => t.type === 'Payment' && t.status === 'Completed')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            await finance.update({ paidAmount: totalPaid });
        }
    } catch (err) {
        console.error("Failed to update aggregates", err);
    }
};
