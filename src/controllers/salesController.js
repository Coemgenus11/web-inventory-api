const service = require('../services/salesService');

const checkout = async (req, res) => {
  try {
    const { items, cash_tendered } = req.body;
    const sale = await service.createSale({ items, cash_tendered });
    res.status(201).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const list = async (req, res) => {
  const sales = await service.listSales();
  res.json(sales);
};

const getOne = async (req, res) => {
  const sale = await service.getSale(req.params.id);
  if (!sale) return res.status(404).json({ error: 'Not found' });
  res.json(sale);
};
const dashboard = async (req, res) => {
  const data = await service.getDashboard();
  res.json(data);
};

const returnSale = async (req, res) => {
  const result = await service.processReturn(req.params.id, req.body);
  res.status(201).json(result);
};
module.exports = { checkout, list, getOne, dashboard, returnSale };
