import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, phone: { type: String, default: '' }, username: { type: String, required: true, unique: true, lowercase: true, trim: true }, password_hash: { type: String, required: true }, monthly_amount: { type: Number, required: true, min: 0 }, joined_date: { type: Date, default: Date.now }, is_active: { type: Boolean, default: true } }, { timestamps: true });
export default mongoose.models.Member || mongoose.model('Member', schema, 'members');
