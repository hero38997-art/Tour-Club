import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const open = ['/setup', '/login'];
  const isApi = path.startsWith('/api/');
  if (open.includes(path) || isApi) return NextResponse.next();
  const token = req.cookies.get('fund_session')?.value;
  let valid = false;
  try { if (token && process.env.JWT_SECRET) { await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)); valid = true; } } catch {}
  if (!valid) return NextResponse.redirect(new URL('/login', req.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
