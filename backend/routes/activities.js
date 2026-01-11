const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.use(authMiddleware);

// Get recent activities (notifications)
router.get('/', activityController.getRecentActivities);

// Get activity stats for charts
router.get('/stats', checkRole(['admin']), activityController.getActivityStats);

module.exports = router;
