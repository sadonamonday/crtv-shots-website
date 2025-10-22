import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import buildApiUrl, { fetchJson } from "../../utils/api";

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
      <span style={{ opacity: 0.85 }}>{label}</span>
      {children}
    </label>
  );
}

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const emptyForm = useMemo(() => ({ id: '', name: '', slug: '', description: '' }), []);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchJson('/categories/list.php');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.name) return;
    try {
      const res = await fetch(buildApiUrl('/categories/save.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: form.id ? Number(form.id) : undefined,
          name: form.name,
          slug: form.slug,
          description: form.description || null,
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
      setForm(emptyForm);
    } catch (e) {
      alert(e?.message || 'Failed to save');
    }
  };

  const edit = (cat) => {
    setForm({
      id: cat.id,
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
    });
  };

  const del = async (id) => {
    if (!id) return;
    if (!confirm('Delete this category? This cannot be undone.')) return;
    try {
      const res = await fetch(buildApiUrl('/categories/delete.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Delete failed');
      await load();
    } catch (e) {
      alert(e?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div style={{ display: 'grid', gap: 16 }}>
        <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            <Field label="Name">
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            </Field>
            <Field label="Slug">
              <input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} placeholder="auto from name if empty" />
            </Field>
            <Field label="Description">
              <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
            </Field>
          </div>
          <div style={{ marginTop:10 }}>
            <button type="submit">{form.id? 'Update' : 'Add'} Category</button>
            {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm(emptyForm)}>Cancel</button>}
          </div>
        </form>

        <div style={{ background:'#0f0f0f', border:'1px solid #222', borderRadius:12 }}>
          <div style={{ padding:12, borderBottom:'1px solid #222', fontWeight:700 }}>Existing Categories</div>
          {loading && <div style={{ padding:12, opacity:0.8 }}>Loading…</div>}
          {!loading && error && <div style={{ padding:12, color:'#f66' }}>{error}</div>}
          {!loading && !error && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                <tr style={{ background:'#111' }}>
                  <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
                  <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Name</th>
                  <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Slug</th>
                  <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Products</th>
                  <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Description</th>
                  <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {items.map(i => (
                  <tr key={i.id}>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.name}</td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.slug}</td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.product_count ?? 0}</td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.description || ''}</td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      <button onClick={()=>edit(i)} style={{ marginRight:8 }}>Edit</button>
                      <button onClick={()=>del(i.id)} style={{ color:'#f55' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
