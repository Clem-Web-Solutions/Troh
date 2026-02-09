const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const financeController = require('../controllers/financeController');
// Auth middleware should be applied in index.js or here
// const { authenticate } = require('../middleware/auth'); 
// Assuming auth is handled in main index.js or passed down.

// Projects
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
// router.put('/:id', projectController.updateProject);
// router.delete('/:id', projectController.deleteProject);

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
