import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import buildApiUrl from "../../utils/api";
import { formatZAR } from "../../utils/currency";

function ImageManager({ product, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newImg, setNewImg] = useState({ url: "", alt: "", sort_order: "" });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl(`/products/getProductImages.php?product_id=${product.id}`), { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load images (${res.status})`);
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [product?.id]);

  const add = async (e) => {
    e.preventDefault();
    if (!newImg.url) return;
    try {
      const res = await fetch(buildApiUrl("/products/addProductImage.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: product.id, url: newImg.url, alt: newImg.alt, sort_order: newImg.sort_order ? Number(newImg.sort_order) : undefined })
      });
      if (!res.ok) throw new Error(`Add failed (${res.status})`);
      setNewImg({ url: "", alt: "", sort_order: "" });
      await load();
    } catch (e) {
      setError(e?.message || "Failed to add image");
    }
  };

  const save = async (img) => {
    try {
      const res = await fetch(buildApiUrl("/products/updateProductImage.php"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: img.id, url: img.url, alt: img.alt, sort_order: img.sort_order })
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update image");
    }
  };

  const del = async (img) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(buildApiUrl(`/products/deleteProductImage.php?id=${encodeURIComponent(img.id)}`), { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to delete image");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#0f0f0f", border: "1px solid #222", borderRadius: 12, width: "min(900px, 96vw)", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #222" }}>
          <h3>Images for: {product?.title || product?.name} (#{product?.id})</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div style={{ padding: 12 }}>
          {loading && <div>Loading…</div>}
          {error && <div style={{ color: "#f77" }}>{error}</div>}

          <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px", gap: 8, marginBottom: 12 }}>
            <input placeholder="Image URL" value={newImg.url} onChange={e=>setNewImg(v=>({ ...v, url: e.target.value }))} />
            <input placeholder="Alt" value={newImg.alt} onChange={e=>setNewImg(v=>({ ...v, alt: e.target.value }))} />
            <input placeholder="Sort" type="number" value={newImg.sort_order} onChange={e=>setNewImg(v=>({ ...v, sort_order: e.target.value }))} />
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit">Add Image</button>
            </div>
          </form>

          <div style={{ display: "grid", gap: 8 }}>
            {images.map(img => (
              <div key={img.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 120px auto", gap: 8, alignItems: "center", background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: 8 }}>
                <img src={img.url || "/white image.jpeg"} alt={img.alt || ""} style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 4 }} />
                <input value={img.url || ""} onChange={e=>setImages(list=>list.map(it=>it.id===img.id?{...it,url:e.target.value}:it))} />
                <input value={img.alt || ""} onChange={e=>setImages(list=>list.map(it=>it.id===img.id?{...it,alt:e.target.value}:it))} />
                <input type="number" value={img.sort_order ?? ""} onChange={e=>setImages(list=>list.map(it=>it.id===img.id?{...it,sort_order:Number(e.target.value)||0}:it))} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={()=>save(img)}>Save</button>
                  <button onClick={()=>del(img)} style={{ color: "#f55" }}>Delete</button>
                </div>
              </div>
            ))}
            {images.length === 0 && !loading && <div style={{ color: "#888" }}>No images yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ status: "active", category_id: "", q: "" });

  const emptyForm = useMemo(() => ({
    id: "",
    title: "",
    slug: "",
    description: "",
    price: "",
    currency: "ZAR",
    stock: "",
    status: "active",
    category_id: "",
    image_url: ""
  }), []);

  const [form, setForm] = useState(emptyForm);
  const [showImagesFor, setShowImagesFor] = useState(null);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.category_id) params.set("category_id", String(filters.category_id));
    if (filters.q) params.set("q", filters.q);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl(`/products/getProducts.php${buildQuery()}`), { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map(p => ({
        id: p.id,
        title: p.title || "",
        price: p.price ?? "",
        stock: p.stock ?? 0,
        status: p.status || (p.status === null ? "active" : ""),
        category_id: p.category_id ?? "",
        image_url: p.image_url || ""
      }));
      setItems(mapped);
    } catch (e) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applyFilters = async (e) => {
    e?.preventDefault?.();
    await load();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) { setError("Title is required"); return; }
    try {
      if (form.id) {
        const payload = {
          id: form.id,
          title: form.title,
          slug: form.slug || undefined,
          description: form.description,
          price: form.price !== "" ? Number(form.price) : undefined,
          currency: form.currency || "ZAR",
          stock: form.stock !== "" ? Number(form.stock) : undefined,
          status: form.status || "active",
          category_id: form.category_id !== "" ? Number(form.category_id) : undefined,
        };
        const res = await fetch(buildApiUrl("/products/updateProduct.php"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === form.id ? {
          ...i,
          title: updated.title ?? form.title,
          price: updated.price ?? form.price,
          status: form.status,
          stock: form.stock !== "" ? Number(form.stock) : i.stock,
          category_id: form.category_id !== "" ? Number(form.category_id) : i.category_id
        } : i));
      } else {
        const payload = {
          title: form.title,
          slug: form.slug || undefined,
          description: form.description,
          price: form.price !== "" ? Number(form.price) : 0,
          currency: form.currency || "ZAR",
          stock: form.stock !== "" ? Number(form.stock) : 0,
          status: form.status || "active",
          category_id: form.category_id !== "" ? Number(form.category_id) : undefined,
          image_url: form.image_url || undefined
        };
        const res = await fetch(buildApiUrl("/products/createProduct.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`Create failed (${res.status})`);
        const created = await res.json();
        setItems(prev => [{
          id: created.id,
          title: created.title || form.title,
          price: created.price ?? form.price,
          status: form.status,
          stock: form.stock !== "" ? Number(form.stock) : 0,
          category_id: form.category_id !== "" ? Number(form.category_id) : "",
          image_url: created.image_url || form.image_url || ""
        }, ...prev]);
      }
      setForm(emptyForm);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to save");
    }
  };

  const edit = (i) => setForm({
    id: i.id,
    title: i.title,
    slug: "",
    description: "",
    price: i.price ?? "",
    currency: "ZAR",
    stock: i.stock ?? "",
    status: i.status || "active",
    category_id: i.category_id ?? "",
    image_url: i.image_url || ""
  });

  const archive = async (item) => {
    if (!confirm("Archive this product?")) return;
    try {
      const url = `/products/deleteProduct.php?id=${encodeURIComponent(item.id)}`;
      const res = await fetch(buildApiUrl(url), { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(`Archive failed (${res.status})`);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      setError(err?.message || "Failed to archive");
    }
  };

  const updateStock = async (id, stock) => {
    try {
      const res = await fetch(buildApiUrl("/products/updateStock.php"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, stock: Number(stock) })
      });
      if (!res.ok) throw new Error(`Stock update failed (${res.status})`);
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === id ? { ...i, stock: updated.stock ?? Number(stock) } : i));
    } catch (e) {
      setError(e?.message || "Failed to update stock");
    }
  };

  return (
    <AdminLayout title="Products">
      {/* Filters */}
      <form onSubmit={applyFilters} style={{ background: '#101010', border: '1px solid #222', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          <label>Search<input value={filters.q} onChange={e=>setFilters(v=>({ ...v, q: e.target.value }))} placeholder="Title or slug" /></label>
          <label>Status<select value={filters.status} onChange={e=>setFilters(v=>({ ...v, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select></label>
          <label>Category ID<input type="number" value={filters.category_id} onChange={e=>setFilters(v=>({ ...v, category_id: e.target.value }))} /></label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Apply</button>
          <button type="button" style={{ marginLeft: 8 }} onClick={()=>{ setFilters({ status: 'active', category_id: '', q: '' }); setTimeout(applyFilters, 0); }}>Reset</button>
        </div>
      </form>

      {loading && <div style={{ padding: 8 }}>Loading…</div>}
      {error && <div style={{ padding: 8, color: '#f77' }}>{error}</div>}

      {/* Create/Update form */}
      <form onSubmit={submit} style={{ background:'#121212', border:'1px solid #222', borderRadius:12, padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
          <label>Title<input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required /></label>
          <label>Slug<input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} placeholder="auto if empty" /></label>
          <label>Price<input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} /></label>
          <label>Currency<input value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})} /></label>
          <label>Stock<input type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} /></label>
          <label>Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select></label>
          <label>Category ID<input type="number" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})} /></label>
          {!form.id && (
            <label>Primary Image URL<input value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} placeholder="optional" /></label>
          )}
          <label style={{ gridColumn: '1 / -1' }}>Description<textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={4} /></label>
        </div>
        <div style={{ marginTop:10 }}>
          <button type="submit">{form.id? 'Update' : 'Add'} Product</button>
          {form.id && <button type="button" style={{ marginLeft:8 }} onClick={()=>setForm(emptyForm)}>Cancel</button>}
        </div>
      </form>

      {/* Table */}
      <div style={{ marginTop: 16, overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#111' }}>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>ID</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Image</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Title</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Price</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Stock</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Status</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Category</th>
            <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
          </tr></thead>
          <tbody>{items.map(i => (
            <tr key={i.id}>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.id}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                <img src={i.image_url || "/white image.jpeg"} alt={i.title || ""} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 4 }} />
              </td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.title}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{formatZAR(i.price)}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="number" value={i.stock} onChange={e=>setItems(list=>list.map(it=>it.id===i.id?{...it,stock:Number(e.target.value)}:it))} style={{ width: 80 }} />
                  <button onClick={()=>updateStock(i.id, i.stock)}>Save</button>
                </div>
              </td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.status || 'active'}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>{i.category_id || ''}</td>
              <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                <button onClick={()=>setShowImagesFor(i)} style={{ marginRight:8 }}>Images</button>
                <button onClick={()=>edit(i)} style={{ marginRight:8 }}>Edit</button>
                <button onClick={()=>archive(i)} style={{ color:'#f55' }}>Archive</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {items.length === 0 && !loading && <div style={{ padding: 8, color: '#999' }}>No products found.</div>}
      </div>

      {showImagesFor && (
        <ImageManager product={showImagesFor} onClose={()=>setShowImagesFor(null)} />
      )}
    </AdminLayout>
  );
}
