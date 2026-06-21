import mongoose from 'mongoose';
import { MockModel } from './MockModel.js';

const InvoiceSequenceSchema = new mongoose.Schema({
  sequence_key: { type: String, required: true, unique: true },
  sequence_val: { type: Number, default: 0 }
});

const MongoModel = mongoose.model('InvoiceSequence', InvoiceSequenceSchema);
const MockInvoiceSequenceModel = new MockModel('invoice_sequences');

export default {
  findOneAndUpdate: (q, u, o) => (process.env.USE_MOCK_DB === 'true' ? MockInvoiceSequenceModel.findOneAndUpdate(q, u, o) : MongoModel.findOneAndUpdate(q, u, o))
};
