const db = require('../config/db');

const bulkInsert = async (conn, items) => {
  const values = items.map(i => [i.sale_id, i.product_id, i.sku, i.name, i.unit_price, i.quantity, i.subtotal]);
  await conn.query('INSERT INTO sale_items (sale_id, product_id, sku, name, unit_price, quantity, subtotal) VALUES?', [values]);
};

// const findBySaleId = async (saleId) => {
//   const [rows] = await db.query('SELECT * FROM sale_items WHERE sale_id =?', [saleId]);
//   return rows;
// };

const findBySaleId = async (saleId) => {
  const [rows] = await db.query(`
    SELECT
      si.*,
      COALESCE(SUM(ri.quantity), 0) as returned_qty
    FROM sale_items si
    LEFT JOIN return_items ri ON ri.sale_item_id = si.id
    WHERE si.sale_id =?
    GROUP BY si.id
    ORDER BY si.id
  `, [saleId]);
  return rows;
};

module.exports = { bulkInsert, findBySaleId };