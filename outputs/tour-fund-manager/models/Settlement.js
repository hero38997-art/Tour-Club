import mongoose from 'mongoose';
const schema = new mongoose.Schema({ from_member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, to_member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, amount: { type: Number, required: true, min: 0.01 }, date: { type: Date, default: Date.now }, is_paid: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.models.Settlement || mongoose.model('Settlement', schema, 'settlements');
