import express from 'express';
import User from '../models/User.js';
import { 
  validatePasswordStrength, 
  hashPassword, 
  verifyPassword, 
  createJWTToken 
} from '../utils/helpers.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

export const initTestUsers = async () => {
  const testUsers = [
    { email: 'fresh@eximarg.com', password: 'Fresh@123', role: 'exporter' },
    { email: 'admin@eximarg.com', password: 'Admin@123', role: 'admin' },
    { email: 'provider@eximarg.com', password: 'Provider@123', role: 'service_provider' }
  ];

  for (const u of testUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const hashed = await hashPassword(u.password);
      await User.create({
        email: u.email,
        password_hash: hashed,
        role: u.role,
        level: 1,
        xp: 0,
        readiness_score: 0.0,
        badges: [],
        subscription: null,
        products_locked: false,
        levels_locked: false
      });
    }
  }
  console.log('EXIMARG default test users seeded successfully.');
};

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required.' });
  }

  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      detail: 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number.'
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ detail: 'User with this email already exists.' });
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      email,
      password_hash: hashed,
      role: 'exporter',
      level: 1,
      xp: 0,
      readiness_score: 0.0,
      badges: [],
      subscription: null,
      products_locked: false,
      levels_locked: false
    });

    const token = createJWTToken(user._id.toString(), email, 'exporter');
    res.json({ token, user_id: user._id.toString() });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    const token = createJWTToken(user._id.toString(), user.email, user.role);
    res.json({ token, user_id: user._id.toString() });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ detail: 'User not found.' });
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      level: user.level,
      xp: user.xp,
      readiness_score: user.readiness_score,
      badges: user.badges,
      subscription: user.subscription,
      products_locked: user.products_locked,
      levels_locked: user.levels_locked,
      level_1_identity: user.level_1_identity,
      level_2_exporter: user.level_2_exporter,
      level_3_verification: user.level_3_verification,
      level_4_company: user.level_4_company
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

export default router;
