const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/auth/login', controller.login); // open pa rin
router.get('/auth/me', verifyToken, controller.me);

// ADMIN ONLY
router.post('/auth/register', verifyToken, requireRole('admin'), controller.register);
router.get('/auth/users', verifyToken, requireRole('admin'), controller.list);
router.put('/auth/users/:id/password', verifyToken, requireRole('admin'), controller.updatePassword);
module.exports = router;