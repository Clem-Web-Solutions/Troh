const { Amendment, PaymentMilestone, Project, PhaseTask, Reserve, Phase, Transaction } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const PAYMENT_TEMPLATES = require('../config/paymentTemplates');

exports.generateMilestones = async (projectId, totalBudget, entityType) => {
    try {
        // Ensure we rely on project object for project_id string
        let project = await Project.findByPk(projectId);
        if (!project) {
            console.error(`Project ${projectId} not found for milestone generation`);
            return;
        }

        const projectRef = project.project_id; // String ID
        let projectEntity = project.entité || 'RAW_DESIGN';

        const template = PAYMENT_TEMPLATES[projectEntity];
        if (!template) {
            console.log(`No payment template for entity ${projectEntity}`);
            return;
        }

        for (const [phaseKey, phaseData] of Object.entries(template)) {
            // Ensure phases exist or logic to handle phase_id. 
            // PaymentMilestone requires phase_id. If phase table doesn't have it, we might have issues.
            // But let's assume phaseKey (e.g. 'RD-P1') is what we want.

            for (const milestone of phaseData.milestones) {
                const existing = await PaymentMilestone.findOne({
                    where: { project_id: projectRef, milestone_id: milestone.code }
                });

                if (!existing) {
                    await PaymentMilestone.create({
                        project_id: projectRef,
                        phase_id: phaseKey, // Should match a phase_id in DB if FK exists
                        milestone_id: milestone.code,
                        code: milestone.code,
                        label: milestone.label,
                        percentage: milestone.percentage,
                        status: 'pending'
                    });
                }
            }
        }
        console.log(`Milestones generated for project ${projectId}`);
    } catch (error) {
        console.error("Error generating milestones:", error);
    }
};

exports.getFinance = async (req, res) => {
    try {
        const { projectId: id } = req.params;
        const milestoneCount = await PaymentMilestone.count({ where: { project_id: id } });
        if (milestoneCount === 0) {
            await exports.generateMilestones(id);
        }
        return exports.getPayments(req, res);
    } catch (error) {
        return exports.getPayments(req, res);
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { projectId: id } = req.params;

        // Fetch project with all related data
        const project = await Project.findByPk(id, {
            include: [
                { model: Amendment, as: 'amendments' },
                { model: Reserve, as: 'reserves' },
                { model: Transaction, as: 'transactions' }
            ]
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Total Budget Logic: Project Budget + Approved Amendments
        const baseBudget = parseFloat(project.budget) || 10000;
        let amendmentsTotal = 0;
        if (project.amendments) {
            project.amendments.forEach(am => {
                if (am.status === 'approved' || am.status === 'completed') {
                    amendmentsTotal += (parseFloat(am.amount_added) - parseFloat(am.amount_removed));
                }
            });
        }

        const totalBudget = baseBudget + amendmentsTotal;

        // Calculate Invoiced and Paid totals from Transactions
        let totalInvoiced = 0;
        let totalPaid = 0;

        if (project.transactions) {
            project.transactions.forEach(tx => {
                const amount = parseFloat(tx.amount);
                if (tx.type === 'Invoice') {
                    totalInvoiced += amount;
                } else if (tx.type === 'Payment') {
                    totalPaid += amount;
                }
            });
        }

        const remainingBudget = totalBudget - totalInvoiced;

        // Fetch Milestones using the string project_id (project.project_id)
        // NOT the integer id (project.id)
        const milestones = await PaymentMilestone.findAll({
            where: { project_id: project.project_id },
            order: [['milestone_id', 'ASC']]
        });

        // Enrich milestones with calculated amounts
        const enrichedMilestones = milestones.map(m => {
            const amount = (totalBudget * parseFloat(m.percentage)) / 100;
            return {
                ...m.toJSON(),
                amount
            };
        });

        res.json({
            summary: {
                totalBudget,
                totalInvoiced,
                totalPaid,
                remainingBudget
            },
            transactions: project.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
            milestones: enrichedMilestones,
            amendments: project.amendments || [],
            reserves: project.reserves || []
        });

    } catch (error) {
        console.error("Error in getPayments:", error);
        res.status(500).json({ message: 'Error fetching finance data' });
    }
};

exports.addAmendment = async (req, res) => {
    try {
        const { id } = req.params; // project_id
        const { title, description, amount_added, amount_removed } = req.body;

        const amendmentId = `AM-${id}-${Date.now().toString().slice(-4)}`;

        const amendment = await Amendment.create({
            amendment_id: amendmentId,
            project_id: id,
            title,
            description,
            amount_added: amount_added || 0,
            amount_removed: amount_removed || 0,
            status: 'draft'
        });

        res.json({ success: true, amendment_id: amendmentId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating amendment' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { projectId: id } = req.params;
        const project = await Project.findByPk(id, {
            include: [
                { model: Amendment, as: 'amendments' },
                { model: Reserve, as: 'reserves' },
                { model: Transaction, as: 'transactions' } // Fetch transactions
            ]
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Total Budget Logic: Project Budget + Approved Amendments
        const baseBudget = parseFloat(project.budget) || 10000; // Default fallback if not set

        let amendmentsTotal = 0;
        if (project.amendments) {
            project.amendments.forEach(am => {
                if (am.status === 'approved' || am.status === 'completed') {
                    amendmentsTotal += (parseFloat(am.amount_added) - parseFloat(am.amount_removed));
                }
            });
        }

        const totalBudget = baseBudget + amendmentsTotal;

        // Remaining Budget Logic: Total Budget - Sum(Invoices)
        // User Requirement: "A chaque transaction (paiement ou appel de fonds) : Soustraire... au budget total restant"
        // But logic says: Remaining to Bill/Pay is reduced by Fund Calls?
        // Let's implement: Active Budget = Total - Invoices (Fund Calls)
        // Note: We use 'Invoice' type for Fund Calls based on previous analysis.

        let totalInvoiced = 0;
        let totalPaid = 0;

        if (project.transactions) {
            project.transactions.forEach(tx => {
                const amount = parseFloat(tx.amount);
                if (tx.type === 'Invoice') {
                    totalInvoiced += amount;
                } else if (tx.type === 'Payment') {
                    totalPaid += amount;
                }
            });
        }

        // Using "Budget Restant" as "Available Budget to Call"
        // Or "Remaining to Pay"? 
        // User example: 10k Budget -> 3k Fund Call -> 7k Budget Restant. 
        // So Budget Restant = Total - Invoiced.
        const remainingBudget = totalBudget - totalInvoiced;

        // Also return transactions for history
        // Filter milestones by project_id string
        const milestones = await PaymentMilestone.findAll({
            where: { project_id: project.project_id },
            order: [['milestone_id', 'ASC']]
        });

        // Enrich milestones
        const enrichedMilestones = milestones.map(m => {
            const amount = (totalBudget * parseFloat(m.percentage)) / 100;
            return {
                ...m.toJSON(),
                amount
            };
        });

        res.json({
            summary: {
                totalBudget,
                totalInvoiced,
                totalPaid, // For info
                remainingBudget
            },
            transactions: project.transactions, // Already included in findByPk
            milestones: enrichedMilestones,
            amendments: project.amendments || [],
            reserves: project.reserves || []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching finance data' });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { description, type, amount, status, date, dueDate, milestoneId } = req.body;

        if (type === 'Invoice') {
            const project = await Project.findByPk(projectId, {
                include: [{ model: Transaction, as: 'transactions' }, { model: Amendment, as: 'amendments' }]
            });

            const baseBudget = parseFloat(project.budget) || 10000;
            let amendmentsTotal = 0;
            if (project.amendments) {
                project.amendments.forEach(am => {
                    if (am.status === 'approved' || am.status === 'completed') {
                        amendmentsTotal += (parseFloat(am.amount_added) - parseFloat(am.amount_removed));
                    }
                });
            }
            const totalBudget = baseBudget + amendmentsTotal;

            let currentInvoiced = 0;
            project.transactions.forEach(tx => {
                if (tx.type === 'Invoice') currentInvoiced += parseFloat(tx.amount);
            });

            const remaining = totalBudget - currentInvoiced;
            // STRICT VALIDATION for Fund Calls
            if (parseFloat(amount) > remaining) {
                return res.status(400).json({ message: "Le montant dépasse le budget restant disponible." });
            }
        }

        const transaction = await Transaction.create({
            projectId: projectId,
            description,
            type,
            amount,
            status: status || 'Pending',
            date: date || new Date(),
            dueDate: dueDate || null,
            milestoneId: milestoneId || null
        });

        // Update Linked Milestone Status
        if (milestoneId) {
            const milestone = await PaymentMilestone.findByPk(milestoneId);
            if (milestone) {
                if (type === 'Invoice') {
                    milestone.status = 'invoiced';
                } else if (type === 'Payment') {
                    milestone.status = 'paid';
                }
                await milestone.save();
            }
        }

        // Email Alert for Invoice
        if (type === 'Invoice') {
            const project = await Project.findByPk(projectId, { include: ['client'] });
            if (project && project.client && project.client.email) {
                const { sendEmail } = require('../services/emailService');
                const subject = `Nouvel Appel de Fonds : ${description}`;
                const message = `Bonjour ${project.client.name},<br><br>Un nouvel appel de fonds "${description}" de ${amount}€ a été émis. Date limite : ${new Date(dueDate).toLocaleDateString()}.<br><br>Merci de prévoir le règlement.`;
                sendEmail(project.client.email, subject, message).catch(console.error);
            }
        }

        res.json({ success: true, transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error adding transaction' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.destroy();
        res.json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};

// Add updateTransaction logic for "Modifier" button
exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params; // Transaction ID
        const { amount, date, description, dueDate, status } = req.body;

        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        transaction.amount = amount || transaction.amount;
        transaction.date = date || transaction.date;
        transaction.description = description || transaction.description;
        if (dueDate) transaction.dueDate = dueDate;
        if (status) transaction.status = status;

        await transaction.save();
        res.json({ success: true, transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating transaction' });
    }
};

exports.getMonthlyRevenue = async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const revenue = await Transaction.sum('amount', {
            where: {
                type: 'Payment',
                status: 'Completed',
                date: {
                    [Op.gte]: startOfMonth,
                    [Op.lt]: endOfMonth
                }
            }
        });

        res.json({ revenue: revenue || 0 });
    } catch (error) {
        console.error("Error calculating monthly revenue:", error);
        res.status(500).json({ message: 'Error calculating revenue' });
    }
};

exports.getGlobalFinanceStats = async (req, res) => {
    try {
        // Calculate Total Paid (All projects)
        const totalPaid = await Transaction.sum('amount', {
            where: { type: 'Payment', status: 'Completed' }
        }) || 0;

        // Calculate Total Pending (All projects - Invoices Pending)
        const totalPending = await Transaction.sum('amount', {
            where: { type: 'Invoice', status: 'Pending' }
        }) || 0;

        // Calculate Total Budget of Active Projects
        const projects = await Project.findAll({
            include: [{ model: Amendment, as: 'amendments' }, { model: Transaction, as: 'transactions' }]
        });

        let totalGlobalBudget = 0;
        let totalGlobalInvoiced = 0;

        projects.forEach(p => {
            const base = parseFloat(p.budget) || 0; // Use 0 if not set, avoiding arbitrary defaults for global stats
            let amendments = 0;
            if (p.amendments) {
                p.amendments.forEach(am => {
                    if (am.status === 'approved' || am.status === 'completed') {
                        amendments += (parseFloat(am.amount_added) - parseFloat(am.amount_removed));
                    }
                });
            }
            totalGlobalBudget += (base + amendments);

            if (p.transactions) {
                p.transactions.forEach(tx => {
                    if (tx.type === 'Invoice') totalGlobalInvoiced += parseFloat(tx.amount);
                });
            }
        });

        const totalRemaining = totalGlobalBudget - totalGlobalInvoiced;

        res.json({
            paid: totalPaid,
            pending: totalPending,
            remaining: totalRemaining > 0 ? totalRemaining : 0
        });

    } catch (error) {
        console.error("Error calculating global finance stats:", error);
        res.status(500).json({ message: 'Error calculating global stats' });
    }
};
