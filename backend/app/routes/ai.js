import express from 'express';
import User from '../models/User.js';
import AIUsage from '../models/AIUsage.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const LIMITS = {
  starter: 20,
  growth: 200,
  premium: 1000,
  null: 5
};

router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const subTier = user.subscription;
    const limit = LIMITS[subTier] || 5;

    // Count calls this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await AIUsage.countDocuments({
      user_id: user._id,
      timestamp: { $gte: startOfMonth }
    });

    if (count >= limit) {
      return res.status(429).json({
        detail: `AI monthly limit reached (${count}/${limit} calls used). Please upgrade your subscription.`
      });
    }

    const { prompt, action_type } = req.body;
    let suggestion = 'Eximarg AI consultant recommended: Ensure all products match the correct ITC (HS) 8-digit code. In India, APEDA regulates agricultural food exports, while FIEO provides general RCMC certificates. Ensure your buyer conversation has a formal proforma invoice with clear FOB/CIF terms before shipping.';

    if (prompt?.toLowerCase().includes('reply') || action_type === 'improve_reply') {
      suggestion = 'Dear Buyer, Thank you for expressing interest in our premium export catalog. We have processed your inquiry and attached our detailed FOB pricing table and MOQ tiers. Let us know if you require custom sampling before the bulk deal. Best regards, EXIMARG Export Division.';
    } else if (prompt?.toLowerCase().includes('hsn')) {
      suggestion = 'We suggest reviewing the Spices Board or FIEO directories for the correct HSN code. Common Codes: 0904 (Pepper/Chilli), 1006 (Basmati Rice), 6205 (Cotton Woven Shirts).';
    }

    await AIUsage.create({
      user_id: user._id,
      action: action_type || 'consult',
      prompt
    });

    res.json({
      suggestion,
      calls_used: count + 1,
      limit
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

export default router;
