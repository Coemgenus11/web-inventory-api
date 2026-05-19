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
  const [allTime] = await db.query(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total_amount),0) as total
    FROM sales
  `);

  // BAGO: cash on hand
  const [salesAll] = await db.query(`SELECT COALESCE(SUM(total_amount),0) as total FROM sales`);
  const [returnsAll] = await db.query(`SELECT COALESCE(SUM(total_refund),0) as total FROM returns`);
  const [outsAll] = await db.query(`SELECT COALESCE(SUM(amount),0) as total FROM cash_outs`);

  const salesIn = Number(salesAll[0].total);
  const returnsOut = Number(returnsAll[0].total);
  const expensesOut = Number(outsAll[0].total);
  const onHand = salesIn - returnsOut - expensesOut;


  return { today: today[0], week: week[0], month: month[0], allTime: allTime[0], cash: { salesIn, returnsOut, expensesOut, onHand } };
};

module.exports = { create, findById, findAll, getSummary };