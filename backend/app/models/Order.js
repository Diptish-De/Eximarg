import mongoose from 'mongoose';
import { MockModel } from './MockModel.js';

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer_name: { type: String, required: true },
  buyer_email: { type: String },
  buyer_address: { type: String },
  seller_details: {
    name: String,
    address: String
  },
  products: [
    {
      product_id: String,
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  fob_charges: { type: Number, default: 0.0 },
  cif_charges: { type: Number, default: 0.0 },
  total_amount: { type: Number, default: 0.0 },
  invoice_number: { type: String },
  status: { type: String, default: 'draft' },
  sent_at: { type: Date },
  pdf_base64: { type: String }
}, { timestamps: true });

const MongoModel = mongoose.model('Order', OrderSchema);
const MockOrderModel = new MockModel('orders');

export default {
  create: (doc) => (process.env.USE_MOCK_DB === 'true' ? MockOrderModel.create(doc) : MongoModel.create(doc)),
  find: (q) => (process.env.USE_MOCK_DB === 'true' ? MockOrderModel.find(q) : MongoModel.find(q)),
  findOne: (q) => (process.env.USE_MOCK_DB === 'true' ? MockOrderModel.findOne(q) : MongoModel.findOne(q)),
  deleteOne: (q) => (process.env.USE_MOCK_DB === 'true' ? MockOrderModel.deleteOne(q) : MongoModel.deleteOne(q))
};
