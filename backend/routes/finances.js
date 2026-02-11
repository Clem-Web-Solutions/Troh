const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Global Stats (Must be before /:projectId to avoid conflict)
router.get('/global-stats', financeController.getGlobalFinanceStats);

// Get Monthly Revenue (Global)
router.get('/monthly-revenue', authMiddleware, checkRole(['admin']), financeController.getMonthlyRevenue);

// Get Finance info
router.get('/:projectId', authMiddleware, financeController.getFinance);

// Add Transaction (Payment or Invoice) - Admin only
router.post('/:projectId/transaction', authMiddleware, checkRole(['admin']), financeController.addTransaction);
router.put('/transaction/:id', authMiddleware, checkRole(['admin']), financeController.updateTransaction);
router.delete('/transaction/:id', authMiddleware, checkRole(['admin']), financeController.deleteTransaction);

module.exports = router;
