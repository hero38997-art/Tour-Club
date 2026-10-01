import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import Member from '@/models/Member';
import { createSession, setSessionCookie } from '@/lib/auth';
export const runtime = 'nodejs';
export async function POST(req) {
  try {
    await connectDB(); const { username, password } = await req.json();
    const name = String(username || '').toLowerCase().trim();
    const admin = await Admin.findOne({ username: name });
    const member = admin ? null : await Member.findOne({ username: name, is_active: true });
    const user = admin || member;
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return NextResponse.json({ error: 'username অথবা password সঠিক নয়' }, { status: 401 });
    const role = admin ? 'admin' : 'member';
    const token = await createSession({ _id: user._id, username: user.username, name: user.name, role });
    return setSessionCookie(NextResponse.json({ ok: true, role }), token);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
