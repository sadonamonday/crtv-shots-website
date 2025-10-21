import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import buildApiUrl from "../../utils/api";

export default function ProductsServices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id:'', type:'product', name:'', price:'', active:true });

  // Load products and services from API
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch products
        const [resProducts, resServices] = await Promise.all([
          fetch(buildApiUrl('/products/getProducts.php'), { credentials: 'include' }),
          fetch(buildApiUrl('/services/getServices.php'), { credentials: 'include' }),
        ]);
        if (!resProducts.ok) throw new Error(`Failed to load products (${resProducts.status})`);
        if (!resServices.ok) throw new Error(`Failed to load services (${resServices.status})`);
        const [productsData, servicesData] = await Promise.all([resProducts.json(), resServices.json()]);

        const productsMapped = (Array.isArray(productsData) ? productsData : []).map(p => ({
          id: p.id,
          type: 'product',
          name: p.title || '',
          price: p.price ?? '',
          active: true,
          image_url: p.image_url || ''
        }));

        const servicesMapped = (Array.isArray(servicesData) ? servicesData : []).map(s => ({
          id: s.id,
          type: 'service',
          name: s.title || '',
          price: s.price ?? '',
          active: (s.status ?? 'active') === 'active'
        }));

        setItems([ ...servicesMapped, ...productsMapped ]);
      } catch (e) {
        setError(e?.message || 'Failed to load products/services');
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
      const isService = form.type === 'service';
      if (form.id) {
        // Update
        const res = await fetch(buildApiUrl(isService ? '/services/updateService.php' : '/products/updateProduct.php'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: form.id, title: form.name, price: form.price, status: form.active ? 'active' : 'inactive', type: form.type })
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === form.id ? { ...i, name: updated.title ?? form.name, price: (updated.price ?? form.price), type: form.type, active: form.active } : i));
      } else {
        // Create
        const res = await fetch(buildApiUrl(isService ? '/services/createService.php' : '/products/createProduct.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: form.name, price: form.price, status: form.active ? 'active' : 'inactive', type: form.type })
        });
        if (!res.ok) throw new Error(`Create failed (${res.status})`);
        const created = await res.json();
        setItems(prev => [{ id: created.id, type: form.type, name: created.title || form.name, price: created.price || form.price, active: form.active }, ...prev]);
      }
      setForm({ id:'', type:'product', name:'', price:'', active:true });
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to save');
    }
  };

  const edit = (i) => setForm(i);

  const del = async (item) => {
    try {
      const isService = item.type === 'service';
      const url = isService ? `/services/deleteService.php?id=${encodeURIComponent(item.id)}` : `/products/deleteProduct.php?id=${encodeURIComponent(item.id)}`;
      const res = await fetch(buildApiUrl(url), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      setError(err?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout title="Products & Services">
      {loading && <div style={{ padding: 8 }}>Loading…</div>}
      {error && <div style={{ padding: 8, color: '#f77' }}>{error}</div>}
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
          <label>Type<select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select></label>
          <label>Name<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></label>
          <label>Price ($)<input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} /></label>
          <label>Active<select value={String(form.active)} onChange={e=>setForm({...form, active: e.target.value==='true'})}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select></label>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Item</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm({ id:'', type:'product', name:'', price:'', active:true })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop: 16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Type</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Name</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Price</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Active</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.type}</td>
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
