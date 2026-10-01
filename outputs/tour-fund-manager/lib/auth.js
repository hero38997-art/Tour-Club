import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const key = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  return new TextEncoder().encode(secret);
};
export async function createSession(user) {
  return new SignJWT({ sub: String(user._id), role: user.role, username: user.username, name: user.name || user.username })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(key());
}
export async function readSession(token) {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, key()); return payload; } catch { return null; }
}
export async function currentUser() { return readSession(cookies().get('fund_session')?.value); }
export function setSessionCookie(response, token) {
  response.cookies.set('fund_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return response;
}
export function clearSessionCookie(response) { response.cookies.set('fund_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 }); return response; }
export async function requireUser() { const user = await currentUser(); if (!user) throw Object.assign(new Error('লগইন করুন'), { status: 401 }); return user; }
export async function requireAdmin() { const user = await requireUser(); if (user.role !== 'admin') throw Object.assign(new Error('শুধু admin এই কাজটি করতে পারবেন'), { status: 403 }); return user; }
export function jsonError(error) { return NextResponse.json({ error: error.message || 'অনুরোধটি সম্পন্ন করা যায়নি' }, { status: error.status || 500 }); }
