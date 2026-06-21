import mongoose from 'mongoose';
import { MockModel } from './MockModel.js';

const AuditLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const MongoModel = mongoose.model('AuditLog', AuditLogSchema);
const MockAuditLogModel = new MockModel('audit_logs');

export default {
  create: (doc) => (process.env.USE_MOCK_DB === 'true' ? MockAuditLogModel.create(doc) : MongoModel.create(doc))
};
