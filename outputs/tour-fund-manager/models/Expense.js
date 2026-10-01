import mongoose from 'mongoose';
const schema = new mongoose.Schema({ title: { type: String, required: true, trim: true }, amount: { type: Number, required: true, min: 0.01 }, category: { type: String, default: 'অন্যান্য' }, date: { type: Date, default: Date.now }, paid_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, note: { type: String, default: '' }, created_by: String }, { timestamps: true });
export default mongoose.models.Expense || mongoose.model('Expense', schema, 'expenses');
