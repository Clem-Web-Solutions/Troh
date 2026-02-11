const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const financeController = require('../controllers/financeController');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.use(authMiddleware);

// Projects
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.post('/:id/create-construction', projectController.createConstructionProject); // New route
router.get('/:id', projectController.getProjectById);
// router.put('/:id', projectController.updateProject);
router.delete('/:id', checkRole(['admin']), projectController.deleteProject);

// Sub-resources
router.post('/:id/approve-task', projectController.approveTask);

// Finance / Amendments / Reserves
router.post('/:id/amendments', financeController.addAmendment);
router.get('/:id/payments', financeController.getPayments);
router.post('/:id/reserves', projectController.inputReserve);
router.get('/:id/reserves', projectController.getReserves);

// Documents
// router.get('/:id/documents', docController.listDocuments); 

module.exports = router;
