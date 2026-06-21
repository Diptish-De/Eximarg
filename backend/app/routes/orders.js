import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import InvoiceSequence from '../models/InvoiceSequence.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAudit } from './levels.js';

const router = express.Router();

const getNextInvoiceNumber = async (userId) => {
  // Format: EXIM/YY/<userId4>/0001
  const currentYearYY = new Date().getFullYear().toString().substring(2); // "26" for 2026
  const userId4 = userId.substring(userId.length - 4);
  const sequenceKey = `${userId}_${currentYearYY}`;

  // Atomic Increment
  const seq = await InvoiceSequence.findOneAndUpdate(
    { sequence_key: sequenceKey },
    { $inc: { sequence_val: 1 } },
    { new: true, upsert: true }
  );

  const valStr = seq.sequence_val.toString().padStart(4, '0');
  return `EXIM/${currentYearYY}/${userId4}/${valStr}`;
};

router.post('/', authMiddleware, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      user_id: req.user.sub,
      status: 'draft'
    });
    res.json({ message: 'Draft invoice created successfully', id: order._id.toString() });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.sub });
    const formatted = orders.map(o => ({
      id: o._id.toString(),
      buyer_name: o.buyer_name,
      buyer_email: o.buyer_email,
      buyer_address: o.buyer_address,
      seller_details: o.seller_details,
      products: o.products,
      fob_charges: o.fob_charges,
      cif_charges: o.cif_charges,
      total_amount: o.total_amount,
      invoice_number: o.invoice_number,
      status: o.status,
      pdf_base64: o.pdf_base64
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.get('/:order_id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.order_id, user_id: req.user.sub });
    if (!order) return res.status(404).json({ detail: 'Order/Invoice not found.' });

    res.json({
      id: order._id.toString(),
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      buyer_address: order.buyer_address,
      seller_details: order.seller_details,
      products: order.products,
      fob_charges: order.fob_charges,
      cif_charges: order.cif_charges,
      total_amount: order.total_amount,
      invoice_number: order.invoice_number,
      status: order.status,
      pdf_base64: order.pdf_base64
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.put('/:order_id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.order_id, user_id: req.user.sub });
    if (!order) return res.status(404).json({ detail: 'Order/Invoice not found.' });

    if (order.status === 'sent') {
      return res.status(400).json({ detail: 'Cannot modify a sent invoice.' });
    }

    Object.assign(order, req.body);
    await order.save();

    res.json({ message: 'Invoice draft saved successfully' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.delete('/:order_id', authMiddleware, async (req, res) => {
  try {
    const result = await Order.deleteOne({ _id: req.params.order_id, user_id: req.user.sub, status: 'draft' });
    if (result.deletedCount === 0) {
      return res.status(400).json({ detail: 'Invoice not found or cannot delete sent invoices.' });
    }

    res.json({ message: 'Draft invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/:order_id/send', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.order_id, user_id: req.user.sub });
    if (!order) return res.status(404).json({ detail: 'Order/Invoice not found.' });

    if (order.status === 'sent') {
      return res.json({ message: 'Invoice already sent', invoice_number: order.invoice_number });
    }

    const invoiceNum = await getNextInvoiceNumber(req.user.sub);
    const pdfBase64 = req.body?.pdf_base64 || null;

    order.status = 'sent';
    order.invoice_number = invoiceNum;
    order.sent_at = new Date();
    order.pdf_base64 = pdfBase64;
    await order.save();

    const user = await User.findById(req.user.sub);
    user.readiness_score = 100.0;
    user.level = Math.max(user.level, 7);

    if (!user.badges.includes('first_invoice_sent')) {
      user.badges.push('first_invoice_sent');
      user.xp += 100;
    }

    await user.save();
    await logAudit(user._id, 'Invoice Send', { order_id: order._id.toString(), invoice_number: invoiceNum });

    res.json({
      message: 'Invoice sent successfully',
      invoice_number: invoiceNum,
      xp_gained: 100
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

export default router;
