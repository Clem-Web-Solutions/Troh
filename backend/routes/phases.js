const express = require('express');
const router = express.Router();
const phaseController = require('../controllers/phaseController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// All routes protected
router.use(authMiddleware);

// Get phases for a project
router.get('/:projectId', phaseController.getPhases);

// Create phase (Admin only)
router.post('/:projectId', checkRole(['admin']), phaseController.createPhase);

// Update phase (Admin only)
router.put('/:id', checkRole(['admin']), phaseController.updatePhase);

// Delete phase (Admin only)
router.delete('/:id', checkRole(['admin']), phaseController.deletePhase);

module.exports = router;
