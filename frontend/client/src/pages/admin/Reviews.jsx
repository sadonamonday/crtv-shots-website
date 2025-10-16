import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function Reviews() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_reviews')||'[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ id:'', name:'', rating:5, message:'', approved:false });

  useEffect(()=>{ localStorage.setItem('admin_reviews', JSON.stringify(items)); }, [items]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    if (form.id) setItems(prev => prev.map(i => i.id===form.id ? form : i));
    else setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]);
    setForm({ id:'', name:'', rating:5, message:'', approved:false });
  };

  const edit = (i) => setForm(i);
  const del = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <AdminLayout title="Reviews & Testimonials">
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></label>
          <label>Rating<select value={form.rating} onChange={e=>setForm({...form, rating:Number(e.target.value)})}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select></label>
          <label>Approved<select value={String(form.approved)} onChange={e=>setForm({...form, approved: e.target.value==='true'})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select></label>
        </div>
        <div style={{ marginTop:10 }}>
          <textarea placeholder="Message" value={form.message} onChange={e=>setForm({...form, message:e.target.value})} rows={3} style={{ width:'100%', background:'#0f0f0f', color:'#fff', border:'1px solid #222', borderRadius:8, padding:8 }} />
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Review</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', name:'', rating:5, message:'', approved:false })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop:16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Name</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Rating</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Approved</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Message</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.name}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.rating}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.approved ? 'Yes' : 'No'}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.message}</td>
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
