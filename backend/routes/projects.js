const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.get('/', authMiddleware, projectController.getAllProjects);
router.get('/:id', authMiddleware, projectController.getProjectById);
router.post('/', authMiddleware, checkRole(['admin']), projectController.createProject);
router.patch('/:id', authMiddleware, checkRole(['admin']), projectController.updateProject);

module.exports = router;
