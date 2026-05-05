const service = require('../services/productService');

const create = async (req, res) => {
  try {
    const product = await service.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  const products = await service.getAllProducts();
  res.json(products);
};

const getOne = async (req, res) => {
  const product = await service.getProductBySku(req.params.sku);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
};

const updateStock = async (req, res) => {
  try {
    const { adjustment } = req.body; // halimbawa { "adjustment": -5 }
    const product = await service.adjustStock(req.params.sku, adjustment);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// --- BAGONG METHODS ---
const update = async (req, res) => {
  try {
    const product = await service.updateProduct(req.params.sku, req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await service.deleteProduct(req.params.sku);
    res.json({ message: 'Deleted', sku: req.params.sku });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { create, getAll, getOne, updateStock, update, remove };