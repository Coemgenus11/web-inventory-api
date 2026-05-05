const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const { generateRandomString } = require('../utils/skuGenerator');

const createProduct = async ({ name, category_id, unit_price, retail_price, stock }) => {
  const category = await categoryModel.findById(category_id);
  if (!category) throw new Error('Category hindi nahanap');

  if (unit_price < 0 || stock < 0) throw new Error('Bawal negative ang unit price o stock');
  if (retail_price < 0 || stock < 0) throw new Error('Bawal negative ang retail price o stock');

  let sku;
  let exists = true;
  while (exists) {
    sku = `${category.sku_prefix}-${generateRandomString(12)}`;
    const check = await productModel.findBySku(sku);
    exists =!!check;
  }

  await productModel.insert({ sku, name, category_id, unit_price, retail_price, stock });
  console.log('Data galing sa frontend:', { name, category_id, unit_price, retail_price, stock });
  return await productModel.findBySku(sku);
};

const getAllProducts = () => productModel.findAll();
const getProductBySku = (sku) => productModel.findBySku(sku);

const adjustStock = async (sku, adjustment) => {
  const product = await productModel.findBySku(sku);
  if (!product) throw new Error('Product hindi nahanap');

  const newStock = product.stock + adjustment;
  if (newStock < 0) throw new Error('Insufficient stock, bawal mag-negative');

  await productModel.updateStock(sku, newStock);
  return await productModel.findBySku(sku);
};

// --- BAGO ---
const updateProduct = async (sku, data) => {
  const product = await productModel.findBySku(sku);
  if (!product) throw new Error('Product hindi nahanap');

  const { name, unit_price, retail_price, category_id } = data;
  if (unit_price!== undefined && unit_price < 0) throw new Error('Bawal negative ang unit_price');
  if (retail_price!== undefined && retail_price < 0) throw new Error('Bawal negative ang retail_price');
  if (category_id) {
    const cat = await categoryModel.findById(category_id);
    if (!cat) throw new Error('Category hindi nahanap');
  }

  await productModel.update(sku, { name, unit_price, retail_price, category_id });
  return await productModel.findBySku(sku);
};

const deleteProduct = async (sku) => {
  const product = await productModel.findBySku(sku);
  if (!product) throw new Error('Product hindi nahanap');
  await productModel.remove(sku);
  return true;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductBySku,
  adjustStock,
  updateProduct,
  deleteProduct
};