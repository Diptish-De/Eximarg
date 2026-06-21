import mongoose from 'mongoose';
import { MockModel } from './MockModel.js';

const AIUsageSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  prompt: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const MongoModel = mongoose.model('AIUsage', AIUsageSchema);
const MockAIUsageModel = new MockModel('ai_usages');

export default {
  create: (doc) => (process.env.USE_MOCK_DB === 'true' ? MockAIUsageModel.create(doc) : MongoModel.create(doc)),
  countDocuments: (q) => (process.env.USE_MOCK_DB === 'true' ? MockAIUsageModel.countDocuments(q) : MongoModel.countDocuments(q))
};
