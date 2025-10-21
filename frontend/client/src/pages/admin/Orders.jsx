import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import { listOrders, createOrder, updateOrder, deleteOrder } from "../../api/orders";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: '', customerName: '', total: '', status: 'pending' });

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await listOrders({ limit: 100 });
      setOrders(res.items || []);
    } catch (e) { setError(String(e.message || e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.total) return;
    try {
      if (form.id) {
        const updated = await updateOrder(form.id, {
          customerName: form.customerName,
          total: parseFloat(form.total),
          status: form.status,
        });
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      } else {
        const created = await createOrder({
          customerName: form.customerName,
          total: parseFloat(form.total),
          status: form.status,
          items: [],
        });
        setOrders(prev => [created, ...prev]);
      }
      setForm({ id: '', customerName: '', total: '', status: 'pending' });
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const edit = (o) => setForm({ id: o.id, customerName: o.customerName || o.customer || '', total: o.total || '', status: o.status || 'pending' });

  const del = async (id) => {
    try { await deleteOrder(id); setOrders(prev => prev.filter(o => o.id !== id)); }
    catch (e) { setError(String(e.message || e)); }
  };

  return (
    <AdminLayout title="Orders">
      {error && <div style={{ color:'#f66', marginBottom:8 }}>{error}</div>}
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Customer<input value={form.customerName} onChange={e=>setForm({...form, customerName:e.target.value})} required /></label>
          <label>Total ($)<input type="number" step="0.01" value={form.total} onChange={e=>setForm({...form, total:e.target.value})} required /></label>
          <label>Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select></label>
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit" disabled={loading}>{form.id? 'Update' : 'Create'} Order</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', customerName:'', total:'', status:'pending' })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop: 16, overflowX:'auto' }}>
        {loading ? <div>Loading...</div> : (
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
                  <td style={{ padding:8, borderBottom:'1px solid #222' }}>{o.customerName || o.customer}</td>
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
        )}
      </div>
    </AdminLayout>
  );
}
