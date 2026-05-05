const pool = require('../config/db');

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id =?', [id]);
  return rows[0];
};

module.exports = { findById };