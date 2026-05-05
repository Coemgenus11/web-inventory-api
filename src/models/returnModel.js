const db = require('../config/db');

const create = async (conn, data) => {
  const [res] = await conn.query(
    'INSERT INTO returns (sale_id, receipt_no, total_refund, reason) VALUES (?,?,?,?)',
    [data.sale_id, data.receipt_no, data.total_refund, data.reason || null]
  );
  return res.insertId;
};

const bulkInsertItems = async (conn, items) => {
  if (!items.length) return;
  const values = items.map(i => [i.return_id, i.sale_item_id, i.product_id, i.sku, i.quantity, i.unit_price, i.subtotal]);
  await conn.query(
    'INSERT INTO return_items (return_id, sale_item_id, product_id, sku, quantity, unit_price, subtotal) VALUES?',
    [values]
  );
};

module.exports = { create, bulkInsertItems };