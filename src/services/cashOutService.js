const db = require('../config/db');
const cashOutModel = require('../models/cashOutModel');
const productModel = require('../models/productModel');

const createCashOut = async ({ amount, category, description, items = [], userId }) => {
  if (amount <= 0) throw new Error('Amount dapat positive');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // header lang, wala nang sku
    await cashOutModel.create(conn, {
      amount, category, description, sku: null, quantity: null, created_by: userId
    });

    // loop lahat ng products na binili
    for (const it of items) {
      if (it.sku && it.quantity > 0) {
        await productModel.incrementStock(conn, it.sku, Number(it.quantity));
      }
    }

    await conn.commit();
    return { success: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

const listCashOuts = () => cashOutModel.findAll();

module.exports = { createCashOut, listCashOuts };