import mongoose from 'mongoose';
const schema = new mongoose.Schema({ message: { type: String, required: true, trim: true }, created_by: { type: String, default: '' } }, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.models.Notice || mongoose.model('Notice', schema, 'notices');
