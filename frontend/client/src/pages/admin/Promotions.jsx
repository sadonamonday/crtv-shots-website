import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function Promotions() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_promotions')||'[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ id:'', code:'', type:'percent', value:'', active:true });

  useEffect(()=>{ localStorage.setItem('admin_promotions', JSON.stringify(items)); }, [items]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.code || !form.value) return;
    if (form.id) setItems(prev => prev.map(i => i.id===form.id ? form : i));
    else setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]);
    setForm({ id:'', code:'', type:'percent', value:'', active:true });
  };

  const edit = (i) => setForm(i);
  const del = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <AdminLayout title="Promotions">
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Code<input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} required /></label>
          <label>Type<select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select></label>
          <label>Value<input type="number" step="0.01" value={form.value} onChange={e=>setForm({...form, value:e.target.value})} required /></label>
          <label>Active<select value={String(form.active)} onChange={e=>setForm({...form, active: e.target.value==='true'})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select></label>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Promotion</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', code:'', type:'percent', value:'', active:true })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop:16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Code</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Type</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Value</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Active</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.code}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.type}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.type==='percent' ? `${i.value}%` : `$${i.value}`}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.active ? 'Yes' : 'No'}</td>
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
