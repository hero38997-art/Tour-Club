import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { requireUser, requireAdmin } from '@/lib/auth';
import Member from '@/models/Member';
import Deposit from '@/models/Deposit';
import Expense from '@/models/Expense';
import Settlement from '@/models/Settlement';
import Notice from '@/models/Notice';
import Poll from '@/models/Poll';
import Vote from '@/models/Vote';
const models = { members: Member, deposits: Deposit, expenses: Expense, settlements: Settlement, notices: Notice, polls: Poll };
const plain = (x) => JSON.parse(JSON.stringify(x));
export async function GET(req, { params }) {
  try {
    const user = await requireUser(); await connectDB();
    if (params.resource === 'polls') {
      const poll = await Poll.findById(params.id); if (!poll) return NextResponse.json({ error: 'Poll পাওয়া যায়নি' }, { status: 404 });
      const votes = await Vote.find({ poll_id: poll._id }).populate('member_id', 'name');
      const mine = votes.filter(v => String(v.member_id?._id) === user.sub).map(v => v.option_id);
      const reveal = user.role === 'admin' || !poll.anonymous;
      const voters = reveal ? votes.map(v => ({ member: v.member_id?.name || 'নিষ্ক্রিয় সদস্য', option_id: v.option_id })) : [];
      return NextResponse.json({ poll: plain(poll), totalVoted: new Set(votes.map(v => String(v.member_id?._id))).size, totalMembers: await Member.countDocuments({ is_active: true }), counts: Object.fromEntries(poll.options.map(o => [o.option_id, votes.filter(v => v.option_id === o.option_id).length])), voters, myVotes: mine, closed: !poll.is_active || (poll.deadline && poll.deadline < new Date()) });
    }
    return NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}
export async function PATCH(req, { params }) {
  try {
    await requireAdmin(); await connectDB(); const data = await req.json();
    const Model = models[params.resource]; if (!Model) return NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
    if (params.resource === 'members' && data.password) { data.password_hash = await bcrypt.hash(data.password, 12); delete data.password; }
    if (params.resource === 'polls') { data.is_active = Boolean(data.is_active); }
    const item = await Model.findByIdAndUpdate(params.id, data, { new: true, runValidators: true }).select('-password_hash');
    return item ? NextResponse.json({ item: plain(item) }) : NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}
export async function DELETE(req, { params }) {
  try {
    await requireAdmin(); await connectDB(); const Model = models[params.resource]; if (!Model) return NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
    if (params.resource === 'polls') await Vote.deleteMany({ poll_id: params.id });
    const item = await Model.findByIdAndDelete(params.id); return item ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}
