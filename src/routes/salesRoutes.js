const express = require('express');
const router = express.Router();
const controller = require('../controllers/salesController');


router.get('/sales/dashboard', controller.dashboard);
router.post('/sales', controller.checkout);
router.get('/sales', controller.list);
router.get('/sales/:id', controller.getOne);

//return
router.post('/sales/:id/return', controller.returnSale);
module.exports = router;