const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Get all users (or filter by role) - Admin only
router.get('/', authMiddleware, checkRole(['admin']), userController.getUsers);
router.delete('/:id', authMiddleware, checkRole(['admin']), userController.deleteUser);

module.exports = router;
