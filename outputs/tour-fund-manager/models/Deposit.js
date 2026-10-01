import mongoose from 'mongoose';
const schema = new mongoose.Schema({ member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, amount: { type: Number, required: true, min: 0.01 }, date: { type: Date, default: Date.now }, note: { type: String, default: '' }, created_by: String }, { timestamps: true });
export default mongoose.models.Deposit || mongoose.model('Deposit', schema, 'deposits');
