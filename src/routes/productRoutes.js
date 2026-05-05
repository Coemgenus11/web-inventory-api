const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const { rules, validate } = require('../middleware/validateProduct');

router.get('/products', controller.getAll);
router.get('/products/:sku', controller.getOne);
router.post('/products', rules, validate, controller.create);
router.patch('/products/:sku/stock', controller.updateStock);
router.put('/products/:sku', controller.update); // update name/price/category
router.delete('/products/:sku', controller.remove); // delete

module.exports = router;