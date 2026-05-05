
const pool = require('../config/db');

const insert = async (product) => {
  const [result] = await pool.query('INSERT INTO products SET?', product);
  return result.insertId;
};

const findBySku = async (sku) => {
  const [rows] = await pool.query(
    'SELECT p.*, c.name as category_name, c.sku_prefix FROM products p JOIN categories c ON p.category_id = c.id WHERE p.sku =?',
    [sku]
  );
  return rows[0];
};

const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC'
  );
  return rows;
};

const updateStock = async (sku, newStock) => {
  const [result] = await pool.query('UPDATE products SET stock =? WHERE sku =?', [newStock, sku]);
  return result.affectedRows;
};

const update = async (sku, fields) => {
  const sets = [];
  const values = [];

  if (fields.name!== undefined) { sets.push('name =?'); values.push(fields.name); }
  if (fields.unit_price!== undefined) { sets.push('unit_price =?'); values.push(fields.unit_price); }
  if (fields.retail_price!== undefined) { sets.push('retail_price =?'); values.push(fields.retail_price); }
  if (fields.category_id!== undefined) { sets.push('category_id =?'); values.push(fields.category_id); }

  if (sets.length === 0) return 0;

  values.push(sku);
  const [result] = await pool.query(
    `UPDATE products SET ${sets.join(', ')} WHERE sku =?`,
    values
  );
  return result.affectedRows;
};

const remove = async (sku) => {
  const [result] = await pool.query('DELETE FROM products WHERE sku =?', [sku]);
  return result.affectedRows;
};

// PARA SA POS
const findBySkuForUpdate = async (conn, sku) => {
  const [rows] = await conn.query(
    'SELECT * FROM products WHERE sku =? FOR UPDATE',
    [sku]
  );
  return rows[0];
};

const decrementStock = async (conn, sku, qty) => {
  await conn.query('UPDATE products SET stock = stock -? WHERE sku =?', [qty, sku]);
};

const incrementStock = async (conn, sku, qty) => {
  await conn.query('UPDATE products SET stock = stock +? WHERE sku =?', [qty, sku]);
};
// module.exports = { insert, findBySku, findAll, updateStock, update, remove };
module.exports = {
  findBySku,
  findBySkuForUpdate, // BAGO
  findAll,
  insert,
  updateStock,
  decrementStock, // BAGO
  update,
  remove,
  incrementStock
};