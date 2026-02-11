const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authMiddleware, upload.single('file'), documentController.uploadDocument);
router.get('/:projectId', authMiddleware, documentController.getDocumentsByProject);
router.delete('/:id', authMiddleware, documentController.deleteDocument);

module.exports = router;
