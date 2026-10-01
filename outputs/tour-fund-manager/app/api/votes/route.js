import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Poll from '@/models/Poll';
import Vote from '@/models/Vote';
export async function POST(req) {
  try {
    const user = await requireUser(); if (user.role !== 'member') return NextResponse.json({ error: 'শুধু member ভোট দিতে পারবেন' }, { status: 403 });
    await connectDB(); const { poll_id, option_ids } = await req.json(); const poll = await Poll.findById(poll_id);
    if (!poll) return NextResponse.json({ error: 'Poll পাওয়া যায়নি' }, { status: 404 });
    if (!poll.is_active || (poll.deadline && poll.deadline < new Date())) return NextResponse.json({ error: 'এই poll-এ ভোট বন্ধ' }, { status: 409 });
    const picks = [...new Set(Array.isArray(option_ids) ? option_ids : [option_ids])].filter(Boolean);
    if (!picks.length || picks.some(id => !poll.options.some(o => o.option_id === id)) || (!poll.is_multiple_choice && picks.length !== 1)) return NextResponse.json({ error: 'সঠিক অপশন নির্বাচন করুন' }, { status: 400 });
    await Vote.deleteMany({ poll_id, member_id: user.sub });
    await Vote.insertMany(picks.map(option_id => ({ poll_id, member_id: user.sub, option_id })));
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}
