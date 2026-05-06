const pool = require('../config/db');

const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username =?', [username]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT id, username, full_name, role, created_at FROM users WHERE id =?', [id]);
  return rows[0];
};

const create = async ({ username, password_hash, full_name, role = 'user' }) => {
  const [result] = await pool.query('INSERT INTO users SET?', { username, password_hash, full_name, role });
  return result.insertId;
};

const findAll = async () => {
  const [rows] = await pool.query('SELECT id, username, full_name, role, created_at FROM users ORDER BY id DESC');
  return rows;
};

const updatePassword = async (id, password_hash) => {
  const [result] = await pool.query(
    'UPDATE users SET password_hash =? WHERE id =?',
    [password_hash, id]
  );
  return result.affectedRows;
};
module.exports = { findByUsername, findById, create, findAll, updatePassword };