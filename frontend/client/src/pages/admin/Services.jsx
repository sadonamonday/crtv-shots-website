import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import buildApiUrl from "../../utils/api";

export default function ServicesAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id:'', name:'', price:'', active:true });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl('/services/getServices.php'), { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed to load services (${res.status})`);
        let data;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text?.slice(0,200) || 'Invalid server response');
        }
        const mapped = (Array.isArray(data) ? data : []).map(s => ({
          id: s.id,
          name: s.title || '',
          price: s.price ?? '',
          active: (s.status ?? 'active') === 'active'
        }));
        setItems(mapped);
      } catch (e) {
        setError(e?.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      if (form.id) {
        const res = await fetch(buildApiUrl('/services/updateService.php'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: form.id, title: form.name, price: form.price, status: form.active ? 'active' : 'inactive' })
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === form.id ? { ...i, name: updated.title ?? form.name, price: (updated.price ?? form.price), active: form.active } : i));
      } else {
        const res = await fetch(buildApiUrl('/services/createService.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: form.name, price: form.price, status: form.active ? 'active' : 'inactive' })
        });
        if (!res.ok) throw new Error(`Create failed (${res.status})`);
        const created = await res.json();
        setItems(prev => [{ id: created.id, name: created.title || form.name, price: created.price || form.price, active: form.active }, ...prev]);
      }
      setForm({ id:'', name:'', price:'', active:true });
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to save');
    }
  };

  const edit = (i) => setForm({ id:i.id, name:i.name, price:i.price, active:i.active });

  const del = async (item) => {
    try {
      const url = `/services/deleteService.php?id=${encodeURIComponent(item.id)}`;
      const res = await fetch(buildApiUrl(url), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      setError(err?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout title="Services">
      {loading && <div style={{ padding: 8 }}>Loading…</div>}
      {error && <div style={{ padding: 8, color: '#f77' }}>{error}</div>}
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></label>
          <label>Price ($)<input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} /></label>
          <label>Active<select value={String(form.active)} onChange={e=>setForm({...form, active: e.target.value==='true'})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select></label>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Service</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', name:'', price:'', active:true })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop: 16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Name</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Price</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Active</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.name}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>${i.price}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.active ? 'Yes' : 'No'}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                <button onClick={()=>edit(i)} style={{ marginRight:8 }}>Edit</button>
                <button onClick={()=>del(i)} style={{ color:'#f55' }}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
