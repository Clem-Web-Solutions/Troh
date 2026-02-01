const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/change-password', authController.changePassword);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/verify-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
