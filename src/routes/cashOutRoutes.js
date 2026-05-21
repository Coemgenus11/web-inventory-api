const express = require('express');
const router = express.Router();
const controller = require('../controllers/cashOutController');
const { verifyToken } = require('../middleware/auth');

router.post('/cash-outs', verifyToken, controller.create);
router.get('/cash-outs', verifyToken, controller.list);
router.get('/cash-outs/:id', verifyToken, controller.getOne);
router.put('/cash-outs/:id', verifyToken, controller.update);
router.put('/cash-outs/:id/complete', verifyToken, controller.complete);
router.put('/cash-outs/:id/cancel', verifyToken, controller.cancel);

module.exports = router;