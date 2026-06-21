import express from 'express';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAudit } from './levels.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // Absolute max limit 20MB
});

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const validateFile = (file, maxSizeMb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Invalid file type. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  const sizeLimit = maxSizeMb * 1024 * 1024;
  if (file.size > sizeLimit) {
    throw new Error(`File exceeds maximum size of ${maxSizeMb}MB.`);
  }
};

const toDataUrl = (file) => {
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
};

router.post('/company-logo', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'No file uploaded.' });
  try {
    validateFile(req.file, 5.0);
    const dataUrl = toDataUrl(req.file);

    await User.findByIdAndUpdate(req.user.sub, {
      $set: { 'level_4_company.company_logo': dataUrl }
    });

    await logAudit(req.user.sub, 'Document Upload', { type: 'company_logo', filename: req.file.originalname });
    res.json({ company_logo: dataUrl });
  } catch (error) {
    res.status(400).json({ detail: error.message });
  }
});

router.post('/director-photo', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'No file uploaded.' });
  try {
    validateFile(req.file, 5.0);
    const dataUrl = toDataUrl(req.file);

    await User.findByIdAndUpdate(req.user.sub, {
      $set: { 'level_1_identity.selfie': dataUrl }
    });

    await logAudit(req.user.sub, 'Document Upload', { type: 'director_photo', filename: req.file.originalname });
    res.json({ director_photo: dataUrl });
  } catch (error) {
    res.status(400).json({ detail: error.message });
  }
});

router.post('/extra-document', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'No file uploaded.' });
  try {
    validateFile(req.file, 20.0);
    const dataUrl = toDataUrl(req.file);
    const docId = Math.random().toString(36).substring(7);

    const docEntry = {
      id: docId,
      filename: req.file.originalname,
      content_type: req.file.mimetype,
      data_url: dataUrl
    };

    await User.findByIdAndUpdate(req.user.sub, {
      $push: { extra_documents: docEntry },
      $inc: { xp: 25 }
    });

    await logAudit(req.user.sub, 'Document Upload', { type: 'extra_document', doc_id: docId, filename: req.file.originalname });
    res.json(docEntry);
  } catch (error) {
    res.status(400).json({ detail: error.message });
  }
});

router.get('/extra-documents', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    res.json(user.extra_documents || []);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.delete('/extra-document/:doc_id', authMiddleware, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(req.user.sub, {
      $pull: { extra_documents: { id: req.params.doc_id } }
    });
    if (!result) return res.status(404).json({ detail: 'Document not found.' });

    await logAudit(req.user.sub, 'Document Delete', { doc_id: req.params.doc_id });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

export default router;
