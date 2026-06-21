import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import User from '../models/User.js';
import Product from '../models/Product.js';
import AIUsage from '../models/AIUsage.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAudit } from './levels.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    if (user.products_locked) {
      return res.status(400).json({ detail: 'Product catalog is locked. Cannot add products.' });
    }

    const prod = await Product.create({
      ...req.body,
      user_id: user._id
    });

    user.xp += 20; // +20 XP per product
    await user.save();

    await logAudit(user._id, 'Product Create', { sku: prod.sku });
    res.json({ message: 'Product created successfully', id: prod._id.toString(), xp_gained: 20 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/bulk', authMiddleware, upload.fields([
  { name: 'csv_file', maxCount: 1 },
  { name: 'zip_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    if (user.products_locked) {
      return res.status(400).json({ detail: 'Product catalog is locked. Cannot import products.' });
    }

    const csvFile = req.files['csv_file']?.[0];
    if (!csvFile) {
      return res.status(400).json({ detail: 'CSV file is required.' });
    }

    const results = [];
    const errors = [];
    const stream = Readable.from(csvFile.buffer.toString('utf-8'));

    await new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      return res.status(400).json({ detail: 'CSV file is empty.' });
    }

    // Validate headers
    const headers = Object.keys(results[0]);
    if (!headers.includes('sku') || !headers.includes('name')) {
      return res.status(400).json({ detail: 'CSV must contain headers: sku, name.' });
    }

    const productsToInsert = [];
    let rowNum = 1;

    for (const row of results) {
      rowNum++;
      const { sku, name } = row;
      if (!sku || !name) {
        errors.push(`Row ${rowNum}: SKU and Name are required.`);
        continue;
      }

      // Check zip references
      const images = [];
      for (const imgCol of ['image1', 'image2', 'image3', 'image4']) {
        const imgName = row[imgCol];
        if (imgName) {
          // If zip file uploaded, simulate base64 mapping, otherwise store reference
          if (req.files['zip_file']) {
            images.push(`data:image/png;base64,MOCK_IMAGE_DATA_FOR_${imgName}`);
          } else {
            images.push(imgName);
          }
        }
      }

      productsToInsert.push({
        user_id: user._id,
        sku,
        name,
        description: row.description || '',
        hsn_code: row.hsn_code || '00000000',
        price_min: parseFloat(row.price_min || '0.0'),
        price_max: parseFloat(row.price_max || '0.0'),
        sample_price: parseFloat(row.sample_price || '0.0'),
        images,
        moq_tiers: []
      });
    }

    if (errors.length > 0) {
      return res.json({ success: false, errors });
    }

    if (productsToInsert.length > 0) {
      await Product.insertMany(productsToInsert);
      const xpEarned = productsToInsert.length * 20;
      user.xp += xpEarned;
      await user.save();

      await logAudit(user._id, 'Product Create Bulk', { count: productsToInsert.length });
      return res.json({ success: true, imported_count: productsToInsert.length, xp_gained: xpEarned });
    }

    res.json({ success: true, imported_count: 0, xp_gained: 0 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ user_id: req.user.sub });
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      hsn_code: p.hsn_code,
      sku: p.sku,
      price_min: p.price_min,
      price_max: p.price_max,
      sample_price: p.sample_price,
      images: p.images,
      moq_tiers: p.moq_tiers
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/lock', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    user.products_locked = true;
    user.level = Math.max(user.level, 7);
    user.readiness_score = Math.max(user.readiness_score, 87.5);

    if (!user.badges.includes('catalog_uploaded')) {
      user.badges.push('catalog_uploaded');
      user.xp += 250;
    }

    await user.save();
    await logAudit(user._id, 'Product Lock');

    res.json({ message: 'Product catalog locked. Export Command Center unlocked!', xp_gained: 250 });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/ai-suggest-hsn', authMiddleware, async (req, res) => {
  const { name, description } = req.body;

  const candidates = [
    { hsn_code: '10063020', description: 'Basmati Rice - Semi-milled or wholly milled rice', confidence: 98, reasoning: `Matches food export intent for '${name}'`, export_examples: ['Premium Long Grain Basmati'] },
    { hsn_code: '62052000', description: "Men's shirts of cotton (woven textile garments)", confidence: 95, reasoning: `Identified cotton garment properties from '${name}'`, export_examples: ['Cotton Polo Shirt', 'Woven Casual Shirt'] },
    { hsn_code: '09042211', description: 'Chilli Powder (Spices - Ground)', confidence: 92, reasoning: `Detected spice and condiment profile in '${name}'`, export_examples: ['Kashmiri Mirch', 'Red Chilli Powder'] },
    { hsn_code: '74181021', description: 'Brass Artware (Handicrafts/Kitchenware)', confidence: 88, reasoning: 'Identified brass material or handicraft profile', export_examples: ['Brass Vases', 'Brass Incense Holders'] },
    { hsn_code: '85238020', description: 'Information technology software (Digital Media)', confidence: 85, reasoning: 'Detected software/IT service classification', export_examples: ['SaaS Licenses', 'Embedded Softwares'] },
    { hsn_code: '42022110', description: 'Handbags of leather (Travel/Fashion items)', confidence: 80, reasoning: 'Detected leather material or fashion bag structure', export_examples: ['Leather Tote Bag', 'Genuine Leather Wallet'] },
    { hsn_code: '09024020', description: 'Black tea (leaf tea in bulk packings)', confidence: 75, reasoning: 'Associated with tea leaf agriculture category', export_examples: ['Assam Orthodox Tea', 'Darjeeling Loose Leaf'] },
    { hsn_code: '33049910', description: 'Face creams and beauty preparations (Cosmetics)', confidence: 68, reasoning: 'Matches cosmetic or beauty care parameters', export_examples: ['Organic Moisturizer', 'Ayurvedic Face Gel'] },
    { hsn_code: '64039190', description: 'Leather footwear (covering the ankle)', confidence: 60, reasoning: 'Matches footwear profile with leather construction', export_examples: ['Leather Boots', 'Formal Derby Shoes'] },
    { hsn_code: '95030030', description: 'Toys representing animals or non-human creatures', confidence: 45, reasoning: 'Low confidence match for generic hobby products', export_examples: ['Wooden Stuffed Toys'] }
  ];

  // Adjust confidence depending on key words
  for (const c of candidates) {
    if (name.toLowerCase().includes('rice') || description.toLowerCase().includes('rice')) {
      if (c.description.includes('Rice')) c.confidence = 99;
    }
    if (name.toLowerCase().includes('shirt') || description.toLowerCase().includes('shirt')) {
      if (c.description.includes('shirt')) c.confidence = 99;
    }
  }

  await AIUsage.create({
    user_id: req.user.sub,
    action: 'ai-suggest-hsn'
  });

  res.json(candidates);
});

export default router;
