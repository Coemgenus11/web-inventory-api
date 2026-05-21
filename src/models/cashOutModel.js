const db = require('../config/db');

const create = async (conn, { amount, category, description, created_by }) => {
  const [res] = await conn.query(
    'INSERT INTO cash_outs (amount, category, description, created_by, status) VALUES (?,?,?,?,?)',
    [amount, category, description || null, created_by, 'pending']
  );
  return res.insertId;
};

const addItem = async (conn, cashOutId, { product_id, sku, quantity, unit_cost }) => {
  await conn.query(
    'INSERT INTO cash_out_items (cash_out_id, product_id, sku, quantity, unit_cost) VALUES (?,?,?,?,?)',
    [cashOutId, product_id, sku, quantity, unit_cost]
  );
};

const findAll = async () => {
  const [rows] = await db.query(
    `SELECT co.id, co.amount, co.category, co.description, co.status,
            co.created_at, co.updated_at, u.username,
            (SELECT COUNT(*) FROM cash_out_items WHERE cash_out_id = co.id) as items_count
     FROM cash_outs co
     LEFT JOIN users u ON u.id = co.created_by
     ORDER BY co.created_at DESC LIMIT 200`
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM cash_outs WHERE id =?', [id]);
  return rows[0];
};

const getItems = async (cashOutId) => {
  const [rows] = await db.query(
    `SELECT ci.*, p.name as product_name
     FROM cash_out_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cash_out_id =?`, [cashOutId]
  );
  return rows;
};
const update = async (conn, id, { amount, category, description }) => {
  await conn.query(
    'UPDATE cash_outs SET amount=?, category=?, description=? WHERE id=?',
    [amount, category, description, id]
  );
};

const updateStatus = async (conn, id, status) => {
  await conn.query('UPDATE cash_outs SET status=? WHERE id=?', [status, id]);
};

const deleteItems = async (conn, cashOutId) => {
  await conn.query('DELETE FROM cash_out_items WHERE cash_out_id=?', [cashOutId]);
};

// DITO NAGBAGO: complete lang ang binibilang
const getTotalOut = async () => {
  const [rows] = await db.query("SELECT COALESCE(SUM(amount),0) as total FROM cash_outs WHERE status = 'complete'");
  return Number(rows[0].total);
};

// dagdag after getItems



module.exports = {
  create, addItem, findAll, findById, getItems, getTotalOut,
  update, updateStatus, deleteItems
};

// module.exports = { create, addItem, findAll, findById, getItems, getTotalOut };