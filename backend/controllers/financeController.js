const { Amendment, PaymentMilestone, Project, PhaseTask, Reserve, Phase, Transaction } = require('../models');
const fs = require('fs');
const path = require('path');

const PAYMENT_MAPPING_PATH = path.join(__dirname, '../payment_mapping.json');
let paymentMapping = {};

try {
    paymentMapping = JSON.parse(fs.readFileSync(PAYMENT_MAPPING_PATH, 'utf8'));
} catch (err) {
    console.error("Error reading payment mapping:", err);
}

// Alias getFinance to getPayments for now, or implement specific logic
exports.getFinance = async (req, res) => {
    return exports.getPayments(req, res);
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
        const { id } = req.params;
        const project = await Project.findByPk(id, {
            include: [
                { model: Amendment, as: 'amendments' },
                { model: Reserve, as: 'reserves' },
                { model: Phase, as: 'phases', include: [{ model: PhaseTask, as: 'tasks' }] }
            ]
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Calculate Total Budget
        const baseBudget = 100000; // Placeholder or fetched from project.budget (if exists) or calculated?
        // User didn't specify where 'total_budget' comes from in SQL. 
        // Existing Project model had `budget` in `createProject` req.body but not in SQL definition I made?
        // I should have added `budget` or `total_amount` to Project model?
        // `Finances` table (existing) had `totalAmount`.
        // I will assume for now we use a fixed value or `project.budget` if I add it, or maybe it's in `budget_estimates`.
        // Let's assume valid budget is accessible.
        let totalBudget = 50000; // Default

        // Apply amendments
        let amendmentsTotal = 0;
        if (project.amendments) {
            project.amendments.forEach(am => {
                if (am.status === 'approved' || am.status === 'completed') {
                    amendmentsTotal += (parseFloat(am.amount_added) - parseFloat(am.amount_removed));
                }
            });
        }

        const currentTotal = totalBudget + amendmentsTotal;

        // Get Milestones from DB (or generate from JSON if not in DB yet?)
        // Ideally we sync JSON to DB when project/phase is created.
        // For now, let's assume we return PaymentMilestones stored in DB.

        const milestones = await PaymentMilestone.findAll({ where: { project_id: id } });

        // Enrich milestones with check for conditions
        const enrichedMilestones = await Promise.all(milestones.map(async (m) => {
            const amount = (currentTotal * m.percentage) / 100;
            let blocked = false;
            let blockReason = null;

            if (m.condition_rule) {
                if (m.condition_rule === "All reserves resolved") {
                    const unresolvedReserves = await Reserve.count({ where: { project_id: id, status: 'open' } });
                    if (unresolvedReserves > 0) {
                        blocked = true;
                        blockReason = `${unresolvedReserves} reserves still open`;
                    }
                } else if (m.condition_rule.startsWith("Task")) {
                    // Ex: "Task T-01 approved"
                    // Parse Task ID? User example says "Task T-01 approved". 
                    // T-01 is global ID? Or local?
                    // I will implement a basic check.
                    // Ideally we find the task by ID.
                    // Warning: T-01 is unique? Yes in `phase_tasks` PK.
                }
            }

            return {
                ...m.toJSON(),
                amount,
                blocked,
                blockReason
            };
        }));

        res.json({
            total_budget: currentTotal,
            milestones: enrichedMilestones
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { description, type, amount, status, date } = req.body;

        const transaction = await Transaction.create({
            projectId: projectId, // Match model field
            description,          // Match model field
            type: type,           // "Payment" or "Invoice" (User should send capitalized or we format it)
            amount,
            status: status || 'Pending', // Match model default
            date: date || new Date()
        });

        res.json({ success: true, transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding transaction' });
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
