const router = require('express').Router();
const { signup, login, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);

// Requires auth (logged in)
router.put('/password', authMiddleware, changePassword);

// Public (before login)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;