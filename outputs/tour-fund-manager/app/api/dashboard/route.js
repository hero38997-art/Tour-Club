import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Deposit from '@/models/Deposit';
import Expense from '@/models/Expense';
import Member from '@/models/Member';
export async function GET() {
  try {
    const user = await requireUser(); await connectDB();
    const [deposits, expenses, members] = await Promise.all([Deposit.find(), Expense.find(), Member.find({ is_active: true }).select('name username monthly_amount')]);
    const totalFund = deposits.reduce((s,x) => s+x.amount, 0), totalExpense = expenses.reduce((s,x) => s+x.amount, 0);
    const months = Array.from({ length: 6 }, (_,i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-5+i); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; return { month: d.toLocaleDateString('bn-BD',{month:'short'}), deposits: deposits.filter(x => String(x.date).slice(0,7)===key).reduce((s,x)=>s+x.amount,0), expenses: expenses.filter(x => String(x.date).slice(0,7)===key).reduce((s,x)=>s+x.amount,0) }; });
    const mineDeposits = deposits.filter(x => String(x.member_id)===user.sub).reduce((s,x)=>s+x.amount,0);
    const mineExpenses = expenses.filter(x => String(x.paid_by)===user.sub).reduce((s,x)=>s+x.amount,0);
    return NextResponse.json({ totalFund, totalExpense, balance: totalFund-totalExpense, depositsCount: deposits.length, expensesCount: expenses.length, members, months, mine: { deposits: mineDeposits, expenses: mineExpenses, balance: mineDeposits-mineExpenses } });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: e.status || 500 }); }
}
