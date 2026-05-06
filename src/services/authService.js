const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = async ({ username, password, full_name, role }) => {
  const existing = await userModel.findByUsername(username);
  if (existing) throw new Error('Username already taken');

  const password_hash = await bcrypt.hash(password, 10);
  const id = await userModel.create({ username, password_hash, full_name, role });
  return userModel.findById(id);
};

const login = async ({ username, password }) => {
  const user = await userModel.findByUsername(username);
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid credentials');

  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

  return { token, user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role } };
};

const getAllUsers = () => userModel.findAll();

const updatePassword = async ({ id, newPassword, requester }) => {
  if (requester.role !== 'admin') {
    throw new Error('Admin only');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  const password_hash = await bcrypt.hash(newPassword, 10);
  await userModel.updatePassword(id, password_hash);
  return { success: true };
};

const getUserById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new Error('User not found');
  delete user.password_hash; // wag isama
  return user;
};

module.exports = { register, login, getAllUsers, updatePassword, getUserById };