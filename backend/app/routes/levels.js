import express from 'express';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

export const logAudit = async (userId, action, metadata = {}) => {
  await AuditLog.create({
    user_id: userId,
    action,
    metadata
  });
};

router.post('/1', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const identity = {
      ...req.body,
      verified: true,
      otp_verified: true
    };

    user.level_1_identity = identity;
    user.level = Math.max(user.level, 2);
    user.readiness_score = Math.max(user.readiness_score, 12.5);

    if (!user.badges.includes('identity_verified')) {
      user.badges.push('identity_verified');
      user.xp += 100;
    }

    await user.save();
    await logAudit(user._id, 'Level 1 Identity Completed', { director_name: identity.director_name });

    res.json({ message: 'Level 1 Identity Verification complete', xp_gained: 100 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/2', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const exporter = req.body;
    
    // Mock RCMC suggestions based on Exporter Type / Business Model
    const suggestions = ['FIEO (Federation of Indian Export Organisations)'];
    if (exporter.export_intent?.toLowerCase().includes('agricultural') || exporter.export_intent?.toLowerCase().includes('food')) {
      suggestions.push('APEDA (Agricultural and Processed Food Products Export Development Authority)');
    }
    if (exporter.export_intent?.toLowerCase().includes('spice')) {
      suggestions.push('Spices Board India');
    }
    if (exporter.export_intent?.toLowerCase().includes('chemical')) {
      suggestions.push('CHEMEXCIL');
    }
    if (exporter.export_intent?.toLowerCase().includes('textile') || exporter.export_intent?.toLowerCase().includes('garment')) {
      suggestions.push('AEPC (Apparel Export Promotion Council)');
    }

    exporter.rcmc_suggestions = suggestions;
    user.level_2_exporter = exporter;
    user.level = Math.max(user.level, 3);
    user.readiness_score = Math.max(user.readiness_score, 25.0);

    if (!user.badges.includes('exporter_profile')) {
      user.badges.push('exporter_profile');
      user.xp += 100;
    }

    await user.save();
    await logAudit(user._id, 'Level 2 Exporter Profile Completed', { exporter_type: exporter.exporter_type });

    res.json({ message: 'Level 2 Exporter Profile complete', rcmc_suggestions: suggestions, xp_gained: 100 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/3-verification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const verification = {
      ...req.body,
      trust_score: 92.5,
      verification_score: 100.0,
      risk_score: 15.0
    };

    user.level_3_verification = verification;
    user.level = Math.max(user.level, 4);
    user.readiness_score = Math.max(user.readiness_score, 37.5);

    if (!user.badges.includes('documents_verified')) {
      user.badges.push('documents_verified');
      user.xp += 150;
    }

    await user.save();
    await logAudit(user._id, 'Level 3 Business Verification Completed', { gst: verification.gst });

    res.json({
      message: 'Level 3 Business Verification complete',
      scores: { trust: 92.5, verification: 100.0, risk: 'Low' },
      xp_gained: 150
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/4-company', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const company = req.body;
    user.level_4_company = company;
    user.level = Math.max(user.level, 5);
    user.readiness_score = Math.max(user.readiness_score, 62.5);

    if (!user.badges.includes('company_confirmed')) {
      user.badges.push('company_confirmed');
      user.xp += 200;
    }

    await user.save();
    await logAudit(user._id, 'Level 4 Company Profile Completed', { company_name: company.company_name });

    res.json({ message: 'Level 4 Company Profile complete', xp_gained: 200 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/set-level', authMiddleware, async (req, res) => {
  try {
    const { level } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const lvl = parseInt(level, 10);
    if (isNaN(lvl) || lvl < 1 || lvl > 9) {
      return res.status(400).json({ detail: 'Invalid level value.' });
    }

    user.level = lvl;
    const scoreMap = {
      1: 0.0,
      2: 12.5,
      3: 25.0,
      4: 37.5,
      5: 62.5,
      6: 75.0,
      7: 87.5,
      8: 95.0,
      9: 100.0
    };
    user.readiness_score = scoreMap[lvl] || 100.0;
    
    if (lvl < 5) {
      user.levels_locked = false;
    } else {
      user.levels_locked = true;
    }

    await user.save();
    await logAudit(user._id, `Manually jumped to Level ${lvl}`);

    res.json({ message: `Successfully jumped to level ${lvl}`, level: lvl, readiness_score: user.readiness_score });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/lock', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    user.levels_locked = true;
    await user.save();
    await logAudit(user._id, 'Onboarding Profiles Locked');

    res.json({ message: 'Onboarding levels locked and confirmed successfully.' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

export default router;
