import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import { formatZAR } from "../../utils/currency";

export default function Payments() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_payments')||'[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ id:'', orderId:'', method:'card', amount:'', status:'initiated' });

  useEffect(()=>{ localStorage.setItem('admin_payments', JSON.stringify(items)); }, [items]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.orderId || !form.amount) return;
    if (form.id) setItems(prev => prev.map(i => i.id===form.id ? form : i));
    else setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]);
    setForm({ id:'', orderId:'', method:'card', amount:'', status:'initiated' });
  };

  const edit = (i) => setForm(i);
  const del = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <AdminLayout title="Payments">
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Order ID<input value={form.orderId} onChange={e=>setForm({...form, orderId:e.target.value})} required /></label>
          <label>Method<select value={form.method} onChange={e=>setForm({...form, method:e.target.value})}>
            <option value="card">Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank</option>
          </select></label>
          <label>Amount (R)<input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} required /></label>
          <label>Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option value="initiated">Initiated</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select></label>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Payment</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', orderId:'', method:'card', amount:'', status:'initiated' })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop: 16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Order ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Method</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Amount</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Status</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.orderId}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.method}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{formatZAR(i.amount)}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.status}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                <button onClick={()=>edit(i)} style={{ marginRight:8 }}>Edit</button>
                <button onClick={()=>del(i.id)} style={{ color:'#f55' }}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
