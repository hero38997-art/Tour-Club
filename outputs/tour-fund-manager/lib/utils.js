export const money = (n = 0) => `৳${Number(n || 0).toLocaleString('bn-BD', { maximumFractionDigits: 2 })}`;
export const dateInput = (date = new Date()) => new Date(date).toISOString().slice(0, 10);
export const monthLabel = (date) => new Date(date).toLocaleDateString('bn-BD', { month: 'short', year: '2-digit' });
export function settlementPlan(members, deposits, expenses) {
  const balances = new Map(members.map(m => [String(m._id), 0]));
  deposits.forEach(d => balances.set(String(d.member_id), (balances.get(String(d.member_id)) || 0) + d.amount));
  expenses.forEach(e => balances.set(String(e.paid_by), (balances.get(String(e.paid_by)) || 0) - e.amount));
  const creditors = [...balances].filter(([,v]) => v > 0.009).map(([id,v]) => ({ id, amount:v }));
  const debtors = [...balances].filter(([,v]) => v < -0.009).map(([id,v]) => ({ id, amount:-v }));
  const plan = [];
  let i=0, j=0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    plan.push({ from_member: debtors[i].id, to_member: creditors[j].id, amount: Math.round(amount*100)/100 });
    debtors[i].amount -= amount; creditors[j].amount -= amount;
    if (debtors[i].amount < .01) i++;
    if (creditors[j].amount < .01) j++;
  }
  return plan;
}
