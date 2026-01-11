const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Get Finance info
router.get('/:projectId', authMiddleware, financeController.getFinance);

// Add Transaction (Payment or Invoice) - Admin only
router.post('/:projectId/transaction', authMiddleware, checkRole(['admin']), financeController.addTransaction);
router.delete('/transaction/:id', authMiddleware, checkRole(['admin']), financeController.deleteTransaction);

module.exports = router;
