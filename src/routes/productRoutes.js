//src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { rules, validate } = require('../middleware/validateProduct');
const { verifyToken } = require('../middleware/auth'); // requireRole hindi na kailangan dito

router.get('/products', verifyToken, controller.getAll);
router.get('/products/:sku', verifyToken, controller.getOne);

router.post('/products', verifyToken, rules, validate, controller.create);
router.patch('/products/:sku/stock', verifyToken, controller.updateStock);
router.put('/products/:sku', verifyToken, controller.update);
router.delete('/products/:sku', verifyToken, controller.remove);

module.exports = router;