import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function Orders() {
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_orders')||'[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ id: '', customer: '', total: '', status: 'pending' });

  useEffect(() => { localStorage.setItem('admin_orders', JSON.stringify(orders)); }, [orders]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.customer || !form.total) return;
    if (form.id) setOrders(prev => prev.map(o => o.id === form.id ? form : o));
    else setOrders(prev => [{ ...form, id: Date.now().toString() }, ...prev]);
    setForm({ id: '', customer: '', total: '', status: 'pending' });
  };

  const edit = (o) => setForm(o);
  const del = (id) => setOrders(prev => prev.filter(o => o.id !== id));

  return (
    <AdminLayout title="Orders">
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Customer<input value={form.customer} onChange={e=>setForm({...form, customer:e.target.value})} required /></label>
          <label>Total ($)<input type="number" step="0.01" value={form.total} onChange={e=>setForm({...form, total:e.target.value})} required /></label>
          <label>Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select></label>
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">{form.id? 'Update' : 'Create'} Order</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', customer:'', total:'', status:'pending' })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop: 16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Customer</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Total</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Status</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>{o.id}</td>
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>{o.customer}</td>
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>${o.total}</td>
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>{o.status}</td>
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                  <button onClick={()=>edit(o)} style={{ marginRight:8 }}>Edit</button>
                  <button onClick={()=>del(o.id)} style={{ color:'#f55' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
