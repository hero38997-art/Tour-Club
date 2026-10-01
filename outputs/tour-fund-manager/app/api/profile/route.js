import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Deposit from '@/models/Deposit';
import Expense from '@/models/Expense';
export async function GET() { try { const user=await requireUser(); await connectDB(); const [deposits,expenses]=await Promise.all([Deposit.find({member_id:user.sub}).sort({date:-1}),Expense.find({paid_by:user.sub}).sort({date:-1})]); return NextResponse.json({deposits,expenses}); } catch(e) { return NextResponse.json({error:e.message},{status:e.status||500}); } }
