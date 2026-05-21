const db = require('../config/db');
const cashOutModel = require('../models/cashOutModel');
const productModel = require('../models/productModel');

const createCashOut = async ({ amount, category, description, items = [], userId }) => {
  if (amount <= 0) throw new Error('Amount dapat positive');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const cashOutId = await cashOutModel.create(conn, { amount, category, description, created_by: userId });
    for (const it of items) {
      if (it.sku && it.quantity > 0) {
        const product = await productModel.findBySkuForUpdate(conn, it.sku);
        if (!product) throw new Error(`Hindi nahanap: ${it.sku}`);
        await cashOutModel.addItem(conn, cashOutId, {
          product_id: product.id, sku: it.sku, quantity: Number(it.quantity), unit_cost: product.unit_price
        });
      }
    }
    await conn.commit();
    return { success: true, id: cashOutId };
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
};

const listCashOuts = () => cashOutModel.findAll();

const getCashOut = async (id) => {
  const co = await cashOutModel.findById(id);
  if (!co) return null;
  const items = await cashOutModel.getItems(id);
  return {...co, items };
};

const updateCashOut = async ({ id, amount, category, description, items = [] }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const co = await cashOutModel.findById(id);
    if (!co) throw new Error('Cashout not found');
    if (co.status!== 'pending') throw new Error('Hindi na pwede i-edit, naka-' + co.status + ' na');

    await cashOutModel.update(conn, id, { amount, category, description });
    await cashOutModel.deleteItems(conn, id);

    for (const it of items) {
      if (it.sku && it.quantity > 0) {
        const product = await productModel.findBySkuForUpdate(conn, it.sku);
        if (!product) throw new Error(`Hindi nahanap: ${it.sku}`);
        await cashOutModel.addItem(conn, id, {
          product_id: product.id, sku: it.sku, quantity: Number(it.quantity), unit_cost: product.unit_price
        });
      }
    }
    await conn.commit();
    return { success: true };
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
};

const completeCashOut = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const co = await cashOutModel.findById(id);
    if (!co) throw new Error('Cashout not found');
    if (co.status!== 'pending') throw new Error('Naka-' + co.status + ' na');

    const items = await cashOutModel.getItems(id);
    // saka lang magdagdag sa inventory
    for (const it of items) {
      await productModel.incrementStock(conn, it.sku, it.quantity);
    }

    await cashOutModel.updateStatus(conn, id, 'complete');
    await conn.commit();
    return { success: true };
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
};

const cancelCashOut = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const co = await cashOutModel.findById(id);
    if (!co) throw new Error('Cashout not found');
    if (co.status !== 'pending') throw new Error('Completed na, hindi na pwede i-cancel');

    await cashOutModel.updateStatus(conn, id, 'cancelled');
    await conn.commit();
    return { success: true };
  } catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }
};


module.exports = { createCashOut, listCashOuts, getCashOut, updateCashOut, completeCashOut, cancelCashOut };