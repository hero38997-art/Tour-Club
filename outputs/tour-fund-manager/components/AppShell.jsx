'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ArrowDownToLine, ReceiptText, ArrowLeftRight, Megaphone, Vote, UserRound, LogOut, Moon, Sun, Menu, X } from 'lucide-react';

const nav = [
  ['/dashboard','ড্যাশবোর্ড','Dashboard',LayoutDashboard], ['/members','বন্ধুরা','Members',Users], ['/deposits','জমা','Deposits',ArrowDownToLine], ['/expenses','খরচ','Expenses',ReceiptText], ['/settlement','দেনা-পাওনা','Settlement',ArrowLeftRight], ['/notices','নোটিশ','Notices',Megaphone], ['/polls','ভোট / পরিকল্পনা','Polls',Vote], ['/profile','আমার হিসাব','My profile',UserRound]
];
export default function AppShell({ children }) {
  const path=usePathname(), router=useRouter(), [user,setUser]=useState(null),[ready,setReady]=useState(false),[mobile,setMobile]=useState(false),[dark,setDark]=useState(false);
  const authPage=path==='/login'||path==='/setup';
  useEffect(()=>{ const saved=localStorage.getItem('fund-theme')==='dark'; setDark(saved); document.documentElement.classList.toggle('dark',saved); fetch('/api/auth/me').then(r=>r.json()).then(d=>setUser(d.user)).catch(()=>{}).finally(()=>setReady(true)); },[]);
  useEffect(()=>{ if(ready&&!user&&!authPage) router.replace('/login'); },[ready,user,authPage,router]);
  useEffect(()=>{ if(path==='/login') fetch('/api/auth/setup').then(r=>r.json()).then(d=>{if(d.required)router.replace('/setup')}).catch(()=>{}); if(path==='/setup') fetch('/api/auth/setup').then(r=>r.json()).then(d=>{if(!d.required)router.replace('/login')}).catch(()=>{}); },[path,router]);
  function theme(){const n=!dark;setDark(n);document.documentElement.classList.toggle('dark',n);localStorage.setItem('fund-theme',n?'dark':'light');}
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});setUser(null);router.replace('/login');}
  if(authPage) return <>{children}</>;
  if(!ready||!user) return <main className="min-h-screen grid place-items-center text-sm text-slate-500">লোড হচ্ছে…</main>;
  const links=nav.filter(x=>user.role==='admin'||x[0]!=='/members');
  return <div className="min-h-screen md:flex">
    {mobile&&<button className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={()=>setMobile(false)} aria-label="বন্ধ করুন"/>}
    <aside className={`fixed md:sticky z-50 md:z-10 top-0 left-0 h-screen w-72 shrink-0 bg-forest text-white p-5 flex flex-col transition-transform ${mobile?'translate-x-0':'-translate-x-full md:translate-x-0'}`}>
      <div className="flex items-center justify-between mb-9"><Link href="/dashboard" className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-200 text-forest text-xl">🪙</div><div><b className="text-lg">বন্ধু ফান্ড</b><p className="text-xs text-white/65">Friend Group Fund</p></div></Link><button className="md:hidden" onClick={()=>setMobile(false)}><X/></button></div>
      <p className="px-3 mb-2 text-[11px] uppercase tracking-[.18em] text-white/50">মেনু · MENU</p><nav className="space-y-1">{links.map(([href,bn,en,Icon])=><Link key={href} href={href} onClick={()=>setMobile(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${path===href?'bg-white/15 text-lime-100':'text-white/75 hover:bg-white/10 hover:text-white'}`}><Icon size={18}/><span>{bn}<small className="ml-2 text-white/45">{en}</small></span></Link>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-white/55">লগইন করেছেন</p><p className="mt-1 font-semibold">{user.name||user.username}</p><p className="text-xs text-lime-200">{user.role==='admin'?'Admin':'Member'}</p><button onClick={logout} className="mt-4 flex items-center gap-2 text-sm text-white/70 hover:text-white"><LogOut size={16}/> লগআউট · Logout</button></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-paper/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/85 md:px-8"><button className="md:hidden" onClick={()=>setMobile(true)} aria-label="মেনু"><Menu/></button><p className="text-sm font-semibold text-forest dark:text-lime-200">আমাদের ঘোরাঘুরি, একসাথে হিসাব 🌿</p><div className="flex items-center gap-3"><span className="hidden text-xs text-slate-500 sm:inline">{user.username}</span><button onClick={theme} className="rounded-xl border border-black/10 p-2 dark:border-white/10" aria-label="থিম বদলান">{dark?<Sun size={17}/>:<Moon size={17}/>}</button></div></header><main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main></div>
  </div>;
}
