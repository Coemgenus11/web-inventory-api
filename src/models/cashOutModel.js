const db = require('../config/db');

const create = async (conn, { amount, category, description, sku, quantity, created_by }) => {
  const [res] = await conn.query(
    'INSERT INTO cash_outs (amount, category, description, sku, quantity, created_by) VALUES (?,?,?,?,?,?)',
    [amount, category, description || null, sku || null, quantity || null, created_by]
  );
  return res.insertId;
};

const findAll = async () => {
  const [rows] = await db.query(
    `SELECT co.*, u.username, p.name as product_name
     FROM cash_outs co
     LEFT JOIN users u ON u.id = co.created_by
     LEFT JOIN products p ON p.sku = co.sku
     ORDER BY co.created_at DESC LIMIT 200`
  );
  return rows;
};

const getTotalOut = async () => {
  const [rows] = await db.query('SELECT COALESCE(SUM(amount),0) as total FROM cash_outs');
  return Number(rows[0].total);
};

module.exports = { create, findAll, getTotalOut };