import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import buildApiUrl, { fetchJson } from "../../utils/api";

export default function Reviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ approved: 'all', rating: 'all' });

  const emptyForm = useMemo(() => ({ id:'', name:'', rating:5, content:'', photo_url:'', approved:false }), []);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.approved !== 'all') params.set('approved', filters.approved);
      if (filters.rating !== 'all') params.set('rating', String(filters.rating));
      const data = await fetchJson(`/reviews/admin_list.php${params.toString() ? `?${params.toString()}` : ''}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.content) return;
    try {
      const res = await fetch(buildApiUrl('/reviews/save.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: form.id || undefined,
          name: form.name,
          content: form.content,
          rating: Number(form.rating) || 5,
          photo_url: form.photo_url || null,
          approved: !!form.approved,
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setForm(emptyForm);
      await load();
    } catch (e) {
      alert(e?.message || 'Failed to save testimonial');
    }
  };

  const edit = (i) => setForm({
    id: i.id,
    name: i.name || '',
    rating: i.rating || 5,
    content: i.content || i.message || '',
    photo_url: i.photo_url || '',
    approved: !!i.approved,
  });

  const toggle = async (i, next) => {
    try {
      const res = await fetch(buildApiUrl('/reviews/toggle.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: i.id, approved: !!next })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      alert(e?.message || 'Failed to update status');
    }
  };

  return (
    <AdminLayout title="Reviews & Testimonials">
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></label>
          <label>Rating<select value={form.rating} onChange={e=>setForm({...form, rating:Number(e.target.value)})}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select></label>
          <label>Approved<select value={String(!!form.approved)} onChange={e=>setForm({...form, approved: e.target.value==='true'})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select></label>
          <label>Photo URL<input value={form.photo_url} onChange={e=>setForm({...form, photo_url:e.target.value})} placeholder="https://…" /></label>
        </div>
        <div style={{ marginTop:10 }}>
          <textarea placeholder="Message" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} rows={3} style={{ width:'100%', background:'#0f0f0f', color:'#fff', border:'1px solid #222', borderRadius:8, padding:8 }} />
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Testimonial</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm(emptyForm)}>Cancel</button>}
        </div>
      </form>

      <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:12 }}>
        <div>Filters:</div>
        <label>Approved
          <select value={filters.approved} onChange={e=>setFilters(f=>({ ...f, approved: e.target.value }))}>
            <option value="all">All</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </label>
        <label>Rating
          <select value={filters.rating} onChange={e=>setFilters(f=>({ ...f, rating: e.target.value }))}>
            <option value="all">All</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button onClick={()=>load()}>Refresh</button>
      </div>

      <div style={{ marginTop:16, overflowX:'auto' }}>
        {loading && <div style={{ padding:8, opacity:0.8 }}>Loading…</div>}
        {error && <div style={{ padding:8, color:'#f66' }}>{error}</div>}
        {!loading && !error && (
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
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.content || i.message}</td>
                <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                  <button onClick={()=>edit(i)} style={{ marginRight:8 }}>Edit</button>
                  <button onClick={()=>toggle(i, !i.approved)} style={{ color: i.approved ? '#f55' : '#0ee7b7' }}>{i.approved ? 'Reject' : 'Approve'}</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
