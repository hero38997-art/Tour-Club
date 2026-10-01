import mongoose from 'mongoose';
const schema = new mongoose.Schema({ poll_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true }, member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, option_id: { type: String, required: true }, voted_at: { type: Date, default: Date.now } });
schema.index({ poll_id: 1, member_id: 1, option_id: 1 }, { unique: true });
export default mongoose.models.Vote || mongoose.model('Vote', schema, 'votes');
