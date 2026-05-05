const db = require('../config/db');

const create = async (conn, { receipt_no, total_amount, cash_tendered, change_amount }) => {
  const [result] = await conn.query(
    'INSERT INTO sales (receipt_no, total_amount, cash_tendered, change_amount) VALUES (?,?,?,?)',
    [receipt_no, total_amount, cash_tendered, change_amount]
  );
  return result.insertId;
};

const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM sales WHERE id =?', [id]);
  return rows[0];
};

const findAll = async () => {
  const [rows] = await db.query('SELECT * FROM sales ORDER BY created_at DESC LIMIT 200');
  return rows;
};

const getSummary = async () => {
  const [today] = await db.query(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total_amount),0) as total
    FROM sales WHERE DATE(created_at) = CURDATE()
  `);
  const [week] = await db.query(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total_amount),0) as total
    FROM sales WHERE created_at >= CURDATE() - INTERVAL 6 DAY
  `);
  const [month] = await db.query(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total_amount),0) as total
    FROM sales WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())
  `);
  return { today: today[0], week: week[0], month: month[0] };
};

module.exports = { create, findById, findAll, getSummary };