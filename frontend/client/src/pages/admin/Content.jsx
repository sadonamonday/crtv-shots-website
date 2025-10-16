import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

export default function Content() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_content_items')||'[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ id:'', type:'post', title:'', slug:'', published:true });

  useEffect(()=>{ localStorage.setItem('admin_content_items', JSON.stringify(items)); }, [items]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (form.id) setItems(prev => prev.map(i => i.id===form.id ? form : i));
    else setItems(prev => [{ ...form, id: Date.now().toString() }, ...prev]);
    setForm({ id:'', type:'post', title:'', slug:'', published:true });
  };
  const edit = (i) => setForm(i);
  const del = (id) => setItems(prev => prev.filter(i => i.id!==id));

  return (
    <AdminLayout title="Content Management">
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Type<select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="post">Post</option>
            <option value="page">Page</option>
            <option value="gallery">Gallery Item</option>
            <option value="video">Video</option>
          </select></label>
          <label>Title<input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required /></label>
          <label>Slug<input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} /></label>
          <label>Published<select value={String(form.published)} onChange={e=>setForm({...form, published: e.target.value==='true'})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select></label>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Item</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', type:'post', title:'', slug:'', published:true })}>Cancel</button>}
        </div>
      </form>
      <div style={{ marginTop: 16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Type</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Title</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Slug</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Published</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.type}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.title}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.slug}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.published ? 'Yes' : 'No'}</td>
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
