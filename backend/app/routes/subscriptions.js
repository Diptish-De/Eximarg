import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAudit } from './levels.js';

const router = express.Router();

const PLANS = {
  starter: { name: 'Starter Plan', amount: 99900 },
  growth: { name: 'Growth Plan', amount: 299900 },
  premium: { name: 'Premium Plan', amount: 999900 }
};

router.post('/create-order', authMiddleware, (req, res) => {
  const { plan_id } = req.query;
  if (!plan_id || !PLANS[plan_id]) {
    return res.status(400).json({ detail: 'Invalid plan selected.' });
  }

  const mockOrderId = `order_mock_${Math.random().toString(36).substring(7)}`;
  res.json({
    id: mockOrderId,
    amount: PLANS[plan_id].amount,
    currency: 'INR',
    plan_id
  });
});

router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, plan_id } = req.body;
  if (!razorpay_payment_id || !razorpay_order_id) {
    return res.status(400).json({ detail: 'Payment credentials verification failed.' });
  }

  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    user.subscription = plan_id || 'starter';
    user.level = Math.max(user.level, 6);
    user.readiness_score = Math.max(user.readiness_score, 75.0);

    if (!user.badges.includes('subscriber')) {
      user.badges.push('subscriber');
      user.xp += 200;
    }

    await user.save();
    await logAudit(user._id, 'Subscription Activation', { plan: plan_id, payment_id: razorpay_payment_id });

    res.json({ message: 'Subscription activated successfully', xp_gained: 200 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

export default router;
