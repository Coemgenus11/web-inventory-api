const service = require('../services/cashOutService');

const create = async (req, res) => {
  try {
    const { amount, category, description, items } = req.body;
    await service.createCashOut({ amount, category, description, items, userId: req.user.id })
    res.status(201).json({ message: 'Cash out recorded' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const list = async (req, res) => {
  const data = await service.listCashOuts();
  res.json(data);
};

module.exports = { create, list };