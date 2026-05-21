const service = require('../services/cashOutService');

const create = async (req, res) => {
  try {
    const { amount, category, description, items } = req.body;
    const result = await service.createCashOut({ amount, category, description, items, userId: req.user.id });
    res.status(201).json({ message: 'Cash out created (pending)', id: result.id });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

const list = async (req, res) => {
  const data = await service.listCashOuts();
  res.json(data);
};

const getOne = async (req, res) => {
  const data = await service.getCashOut(req.params.id);
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
};

const update = async (req, res) => {
  try {
    const { amount, category, description, items } = req.body;
    await service.updateCashOut({ id: req.params.id, amount, category, description, items });
    res.json({ message: 'Cash out updated' });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

const complete = async (req, res) => {
  try {
    await service.completeCashOut(req.params.id);
    res.json({ message: 'Cash out completed - nabawas na sa cash, nadagdag na sa stock' });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

const cancel = async (req, res) => {
  try {
    await service.cancelCashOut(req.params.id);
    res.json({ message: 'Cash out cancelled' });
  } catch (e) { res.status(400).json({ error: e.message }); }
};

module.exports = { create, list, getOne, update, complete, cancel };