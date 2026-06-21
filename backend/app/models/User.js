import mongoose from 'mongoose';
import { MockModel } from './MockModel.js';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'exporter' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  readiness_score: { type: Number, default: 0.0 },
  badges: [{ type: String }],
  subscription: { type: String, default: null },
  products_locked: { type: Boolean, default: false },
  levels_locked: { type: Boolean, default: false },
  level_1_identity: {
    director_name: String,
    phone: String,
    email: String,
    address: String,
    pan: String,
    aadhaar: String,
    selfie: String,
    verified: { type: Boolean, default: false },
    otp_verified: { type: Boolean, default: false }
  },
  level_2_exporter: {
    exporter_type: String,
    business_model: String,
    export_intent: String,
    shipments_range: String,
    registration_date: String,
    operating_since: String,
    rcmc_suggestions: [String]
  },
  level_3_verification: {
    gst: String,
    cin: String,
    address_proof: String,
    bank_statement: String,
    ifsc: String,
    ad_code: String,
    iec: String,
    rcmc: String,
    apeda_fssai: String,
    trust_score: { type: Number, default: 0.0 },
    verification_score: { type: Number, default: 0.0 },
    risk_score: { type: Number, default: 0.0 }
  },
  level_4_company: {
    company_logo: String,
    company_name: String,
    website: String,
    social_links: { type: Map, of: String },
    tagline: String
  },
  extra_documents: [
    {
      id: String,
      filename: String,
      content_type: String,
      data_url: String
    }
  ]
}, { timestamps: true });

const MongoModel = mongoose.model('User', UserSchema);
const MockUserModel = new MockModel('users');

export default {
  findOne: (q) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.findOne(q) : MongoModel.findOne(q)),
  findById: (id) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.findById(id) : MongoModel.findById(id)),
  create: (doc) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.create(doc) : MongoModel.create(doc)),
  findByIdAndUpdate: (id, update, opt) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.findByIdAndUpdate(id, update, opt) : MongoModel.findByIdAndUpdate(id, update, opt)),
  updateOne: (q, u) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.updateOne(q, u) : MongoModel.updateOne(q, u)),
  countDocuments: (q) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.countDocuments(q) : MongoModel.countDocuments(q)),
  deleteOne: (q) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.deleteOne(q) : MongoModel.deleteOne(q)),
  insertMany: (docs) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.insertMany(docs) : MongoModel.insertMany(docs)),
  find: (q) => (process.env.USE_MOCK_DB === 'true' ? MockUserModel.find(q) : MongoModel.find(q))
};
