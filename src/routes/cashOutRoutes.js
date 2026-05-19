const express = require('express');
const router = express.Router();
const controller = require('../controllers/cashOutController');
const { verifyToken } = require('../middleware/auth');

router.post('/cash-outs', verifyToken, controller.create);
router.get('/cash-outs', verifyToken, controller.list);

module.exports = router;