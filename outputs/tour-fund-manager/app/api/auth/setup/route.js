import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { createSession, setSessionCookie } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET() { try { await connectDB(); return NextResponse.json({ required: (await Admin.countDocuments()) === 0 }); } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); } }
export async function POST(req) {
  try {
    await connectDB();
    if (await Admin.countDocuments()) return NextResponse.json({ error: 'Admin ইতিমধ্যে তৈরি হয়েছে' }, { status: 409 });
    const { username, password } = await req.json();
    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username || '') || (password || '').length < 8) return NextResponse.json({ error: 'username ৩–৩২ অক্ষর এবং password কমপক্ষে ৮ অক্ষরের দিন' }, { status: 400 });
    const admin = await Admin.create({ username, password_hash: await bcrypt.hash(password, 12) });
    const token = await createSession({ _id: admin._id, username, role: 'admin' });
    return setSessionCookie(NextResponse.json({ ok: true }), token);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
