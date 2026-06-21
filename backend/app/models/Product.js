import mongoose from 'mongoose';
import { MockModel } from './MockModel.js';

const ProductSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  hsn_code: { type: String, required: true },
  sku: { type: String, required: true },
  price_min: { type: Number, required: true },
  price_max: { type: Number, required: true },
  sample_price: { type: Number, default: 0.0 },
  images: [{ type: String }],
  moq_tiers: [{ type: Map, of: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

const MongoModel = mongoose.model('Product', ProductSchema);
const MockProductModel = new MockModel('products');

export default {
  create: (doc) => (process.env.USE_MOCK_DB === 'true' ? MockProductModel.create(doc) : MongoModel.create(doc)),
  find: (q) => (process.env.USE_MOCK_DB === 'true' ? MockProductModel.find(q) : MongoModel.find(q)),
  insertMany: (docs) => (process.env.USE_MOCK_DB === 'true' ? MockProductModel.insertMany(docs) : MongoModel.insertMany(docs))
};
