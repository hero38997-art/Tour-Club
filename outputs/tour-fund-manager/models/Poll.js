import mongoose from 'mongoose';
const schema = new mongoose.Schema({ question: { type: String, required: true, trim: true }, options: [{ option_id: { type: String, required: true }, text: { type: String, required: true, trim: true } }], created_by: String, deadline: { type: Date, default: null }, is_active: { type: Boolean, default: true }, is_multiple_choice: { type: Boolean, default: false }, anonymous: { type: Boolean, default: true } }, { timestamps: { createdAt: 'created_at', updatedAt: true } });
export default mongoose.models.Poll || mongoose.model('Poll', schema, 'polls');
