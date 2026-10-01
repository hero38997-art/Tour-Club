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
import { settlementPlan } from '@/lib/utils';

const models = { members: Member, deposits: Deposit, expenses: Expense, settlements: Settlement, notices: Notice, polls: Poll };
const safe = (docs) => JSON.parse(JSON.stringify(docs));
export async function GET(req, { params }) {
  try {
    const user = await requireUser(); await connectDB();
    const Model = models[params.resource]; if (!Model) return NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
    if (params.resource === 'settlements') {
      const [members, deposits, expenses, settled] = await Promise.all([Member.find({ is_active: true }), Deposit.find(), Expense.find(), Settlement.find({ is_paid: true })]);
      const plan = settlementPlan(members, deposits, expenses);
      return NextResponse.json({ items: safe(plan.map((x,i) => ({ ...x, id: `${x.from_member}-${x.to_member}-${i}`, from_name: members.find(m => String(m._id)===x.from_member)?.name, to_name: members.find(m => String(m._id)===x.to_member)?.name, is_paid: settled.some(s => String(s.from_member)===x.from_member && String(s.to_member)===x.to_member && s.amount >= x.amount) }))) });
    }
    if (params.resource === 'members') return NextResponse.json({ items: safe(await Member.find().select('-password_hash').sort({ createdAt: 1 })) });
    if (params.resource === 'deposits') return NextResponse.json({ items: safe(await Deposit.find().populate('member_id', 'name').sort({ date: -1 })) });
    if (params.resource === 'expenses') return NextResponse.json({ items: safe(await Expense.find().populate('paid_by', 'name').sort({ date: -1 })) });
    if (params.resource === 'polls') {
      const polls = await Poll.find().sort({ created_at: -1 });
      const ids = polls.map(p => p._id);
      const counts = await Vote.aggregate([{ $match: { poll_id: { $in: ids } } }, { $group: { _id: { poll_id: '$poll_id', option_id: '$option_id' }, count: { $sum: 1 } } }]);
      const mine = user.role === 'member' ? await Vote.find({ poll_id: { $in: ids }, member_id: user.sub }) : [];
      return NextResponse.json({ items: safe(polls).map(p => ({ ...p, counts: counts.filter(c => String(c._id.poll_id) === p._id).reduce((a,c) => ({ ...a, [c._id.option_id]: c.count }), {}), myVotes: mine.filter(v => String(v.poll_id) === p._id).map(v => v.option_id) })) });
    }
    return NextResponse.json({ items: safe(await Model.find().sort({ createdAt: -1 })) });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}
export async function POST(req, { params }) {
  try {
    const user = await requireUser(); await connectDB(); const body = await req.json();
    const resource = params.resource; const Model = models[resource]; if (!Model) return NextResponse.json({ error: 'তথ্য পাওয়া যায়নি' }, { status: 404 });
    if (resource === 'deposits' && user.role === 'member') {
      const amount = Number(body.amount); if (!(amount > 0)) return NextResponse.json({ error: 'সঠিক টাকার পরিমাণ দিন' }, { status: 400 });
      return NextResponse.json({ item: safe(await Deposit.create({ member_id: user.sub, amount, date: body.date || new Date(), note: body.note || '', created_by: user.username })) }, { status: 201 });
    }
    await requireAdmin();
    let data = { ...body };
    if (resource === 'members') { if (!body.password || body.password.length < 8) return NextResponse.json({ error: 'Password কমপক্ষে ৮ অক্ষর হতে হবে' }, { status: 400 }); data.password_hash = await bcrypt.hash(body.password, 12); delete data.password; }
    if (resource === 'deposits') data.created_by = user.username;
    if (resource === 'expenses') data.created_by = user.username;
    if (resource === 'notices') data.created_by = user.username;
    if (resource === 'polls') {
      if (!Array.isArray(body.options) || body.options.length < 2 || body.options.length > 5) return NextResponse.json({ error: '২ থেকে ৫টি অপশন দিন' }, { status: 400 });
      data.options = body.options.map((o,i) => ({ option_id: `opt_${Date.now()}_${i}`, text: String(o).trim() })); data.created_by = user.username;
    }
    const item = await Model.create(data); const result = item.toObject(); delete result.password_hash;
    return NextResponse.json({ item: safe(result) }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}

