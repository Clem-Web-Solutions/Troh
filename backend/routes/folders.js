const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const { authMiddleware: protect, checkRole: authorize } = require('../middleware/auth');

// All routes protected
router.use(protect);

router.post('/', authorize('admin'), folderController.createFolder);
router.get('/:projectId', folderController.getFolders); // Clients can view folders too
router.delete('/:id', authorize('admin'), folderController.deleteFolder);

module.exports = router;
