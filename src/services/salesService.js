const db = require('../config/db');
const productModel = require('../models/productModel');
const salesModel = require('../models/salesModel');
const salesItemModel = require('../models/salesItemModel');

const generateReceipt = () => {
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.floor(1000 + Math.random()*9000);
  return `R${ymd}${rand}`;
};

const createSale = async ({ items, cash_tendered = 0 }) => {
  if (!items ||!items.length) throw new Error('Walang items sa cart');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const detailed = [];

    for (const it of items) {
      const qty = Number(it.qty);
      if (qty <= 0) throw new Error('Invalid quantity');

      const product = await productModel.findBySkuForUpdate(conn, it.sku);
      if (!product) throw new Error(`Hindi nahanap: ${it.sku}`);
      if (product.stock < qty) throw new Error(`Kulang stock sa ${product.name}. Available: ${product.stock}`);

      const subtotal = Number(product.retail_price) * qty;
      total += subtotal;

      detailed.push({
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        unit_price: product.retail_price,
        quantity: qty,
        subtotal
      });
    }

    const change = Math.max(0, Number(cash_tendered) - total);
    const receipt_no = generateReceipt();

    const saleId = await salesModel.create(conn, {
      receipt_no,
      total_amount: total,
      cash_tendered,
      change_amount: change
    });

    const itemsToInsert = detailed.map(d => ({...d, sale_id: saleId }));
    await salesItemModel.bulkInsert(conn, itemsToInsert);

    for (const d of detailed) {
      await productModel.decrementStock(conn, d.sku, d.quantity);
    }

    await conn.commit();

    const sale = await salesModel.findById(saleId);
    const saleItems = await salesItemModel.findBySaleId(saleId);
    return {...sale, items: saleItems };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const listSales = () => salesModel.findAll();

const getSale = async (id) => {
  const sale = await salesModel.findById(id);
  if (!sale) return null;
  const items = await salesItemModel.findBySaleId(id);
  return {...sale, items };
};

const getDashboard = async () => {
  const summary = await salesModel.getSummary();
  const history = await salesModel.findAll(); // yung existing mo na
  return { summary, history };
};

// RETURN
const returnModel = require('../models/returnModel');

const processReturn = async (saleId, { items, reason }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const sale = await salesModel.findById(saleId);
    if (!sale) throw new Error('Sale not found');

    const saleItems = await salesItemModel.findBySaleId(saleId);
    let totalRefund = 0;
    const toReturn = [];

    for (const r of items) {
      const si = saleItems.find(i => i.id === r.sale_item_id);
      if (!si) throw new Error('Item not found');
      if (r.qty > si.quantity) throw new Error(`Hanggang ${si.quantity} lang pwede ibalik sa ${si.name}`);

      const subtotal = Number(si.unit_price) * r.qty;
      totalRefund += subtotal;
      toReturn.push({...si, return_qty: r.qty, subtotal});
    }

    const receipt_no = 'RET' + Date.now();
    const returnId = await returnModel.create(conn, {
      sale_id: saleId,
      receipt_no,
      total_refund: totalRefund,
      reason
    });

    await returnModel.bulkInsertItems(conn, toReturn.map(t => ({
      return_id: returnId,
      sale_item_id: t.id,
      product_id: t.product_id,
      sku: t.sku,
      quantity: t.return_qty,
      unit_price: t.unit_price,
      subtotal: t.subtotal
    })));

    // ibalik sa stock
    for (const t of toReturn) {
      await productModel.incrementStock(conn, t.sku, t.return_qty); // kailangan mo ng incrementStock sa productModel
    }

    await conn.commit();
    return { receipt_no, total_refund: totalRefund };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

module.exports = { createSale, listSales, getSale, getDashboard, processReturn };
// module.exports = { createSale, listSales, getSale, getDashboard };