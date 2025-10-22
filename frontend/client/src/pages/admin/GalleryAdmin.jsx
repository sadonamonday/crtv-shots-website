import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import buildApiUrl from "../../utils/api";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

function Guard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(buildApiUrl('/auth/me.php'), { credentials: 'include' });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const isAdmin = Boolean(data?.authenticated && data?.is_admin && data?.role === 'admin');
          if (!cancelled) setAllowed(isAdmin);
        } else {
          if (!cancelled) setAllowed(false);
        }
      } catch {
        if (!cancelled) setAllowed(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#fff' }}>Checking admin access…</div>;
  if (!allowed) return (
    <div style={{ padding: 24, color: '#fff' }}>
      <h2 style={{ marginTop: 0 }}>Unauthorized</h2>
      <p>You must be an admin to view this page.</p>
      <p>
        <Link to="/login" style={{ color: '#06d6a0' }}>Go to login</Link>
      </p>
    </div>
  );
  return children;
}

function Row({ item, onToggle, onDelete }) {
  return (
    <tr>
      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{item.id}</td>
      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
        <img src={item.url} alt={item.title || 'image'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
      </td>
      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{item.title || '—'}</td>
      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{item.visible ? 'Yes' : 'No'}</td>
      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{item.sort}</td>
      <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
        <button onClick={() => onToggle(item)} style={{ marginRight: 8 }}>{item.visible ? 'Hide' : 'Show'}</button>
        <button onClick={() => onDelete(item.id)} style={{ color: '#f55' }}>Delete</button>
      </td>
    </tr>
  );
}

export default function GalleryAdmin() {
  const [tab, setTab] = useState('photos'); // 'photos' | 'items'
  const [photos, setPhotos] = useState([]);
  const [items, setItems] = useState([]);
  // photo upload state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [sort, setSort] = useState(0);
  const [url, setUrl] = useState('');
  // item edit/create state
  const [itemForm, setItemForm] = useState({ id: 0, media_id: '', title: '', description: '', visible: true, sort_order: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [resPhotos, resItems] = await Promise.all([
        fetch(buildApiUrl('/gallery/list.php?all=1'), { credentials: 'include' }),
        fetch(buildApiUrl('/gallery/items/list.php?all=1'), { credentials: 'include' })
      ]);
      if (!resPhotos.ok) throw new Error('Failed to load photos');
      const dataPhotos = await resPhotos.json();
      setPhotos(Array.isArray(dataPhotos) ? dataPhotos : []);
      const dataItems = resItems.ok ? await resItems.json() : [];
      setItems(Array.isArray(dataItems) ? dataItems : []);
      setError('');
    } catch (e) {
      setError(e?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file && !url) {
      setError('Please choose a file or provide an image URL.');
      return;
    }
    const form = new FormData();
    if (file) form.append('image', file);
    if (url) form.append('url', url);
    if (title) form.append('title', title);
    form.append('sort', String(sort || 0));
    try {
      const res = await fetch(buildApiUrl('/gallery/upload.php'), { method: 'POST', body: form, credentials: 'include' });
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Upload failed');
        throw new Error(msg || 'Upload failed');
      }
      setFile(null);
      setTitle('');
      setUrl('');
      await load();
    } catch (e) {
      setError(e?.message || 'Upload error');
    }
  };

  const togglePhoto = async (it) => {
    try {
      const res = await fetch(buildApiUrl('/gallery/update.php'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: it.id, visible: !it.visible })
      });
      if (!res.ok) throw new Error('Update failed');
      await load();
    } catch (e) {
      setError(e?.message || 'Update error');
    }
  };

  const removePhoto = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const res = await fetch(buildApiUrl('/gallery/delete.php?id=' + encodeURIComponent(id)), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch (e) {
      setError(e?.message || 'Delete error');
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...itemForm, visible: !!itemForm.visible };
      const res = await fetch(buildApiUrl('/gallery/items/save.php'), {
        method: itemForm.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      setItemForm({ id: 0, media_id: '', title: '', description: '', visible: true, sort_order: 0 });
      await load();
      setTab('items');
    } catch (e) {
      setError(e?.message || 'Save error');
    }
  };

  const editItem = (it) => {
    setItemForm({
      id: it.id,
      media_id: it.media_id || '',
      title: it.title || '',
      description: it.description || '',
      visible: !!it.visible,
      sort_order: it.sort_order || 0,
    });
    setTab('items');
  };

  const toggleItem = async (it) => {
    try {
      const res = await fetch(buildApiUrl('/gallery/items/save.php'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: it.id, visible: !it.visible })
      });
      if (!res.ok) throw new Error('Update failed');
      await load();
    } catch (e) {
      setError(e?.message || 'Update error');
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(buildApiUrl('/gallery/items/delete.php?id=' + encodeURIComponent(id)), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch (e) {
      setError(e?.message || 'Delete error');
    }
  };

  return (
    <AdminLayout title="Gallery">
      <div style={{ padding: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Gallery Manager</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 12 }}>Dashboard</Link>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('photos')} disabled={tab==='photos'}>Photos</button>
          <button onClick={() => setTab('items')} disabled={tab==='items'}>Items</button>
        </div>

        {tab === 'photos' && (
          <>
            <form onSubmit={upload} style={{ marginTop: 16, background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                <label>
                  <div>Image file</div>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <div style={{ fontSize: 12, color: '#aaa' }}>Optional if you provide a URL</div>
                </label>
                <label>
                  <div>Image URL</div>
                  <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/image.jpg (optional)" />
                  <div style={{ fontSize: 12, color: '#aaa' }}>Optional if you uploaded a file</div>
                </label>
                <label>
                  <div>Title</div>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
                </label>
              </div>
              <div style={{ marginTop: 12 }}>
                <button type="submit">Add photo</button>
              </div>
            </form>

            {loading ? (
              <div style={{ marginTop: 16 }}>Loading…</div>
            ) : error ? (
              <div style={{ marginTop: 16, color: '#f88' }}>{error}</div>
            ) : (
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#111' }}>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>ID</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Preview</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Title</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Visible</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Sort</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {photos.map((it) => (
                      <tr key={it.id}>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.id}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                          <img src={it.url} alt={it.title || 'image'} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.title || '—'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.visible ? 'Yes' : 'No'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.sort}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                          <button onClick={async () => {
                            const newTitle = window.prompt('New title:', it.title || '');
                            if (newTitle === null) return;
                            const newSortStr = window.prompt('New sort (number):', String(it.sort || 0));
                            if (newSortStr === null) return;
                            const newSort = parseInt(newSortStr || '0', 10);
                            try {
                              const res = await fetch(buildApiUrl('/gallery/update.php'), {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ id: it.id, title: newTitle, sort: newSort })
                              });
                              if (!res.ok) throw new Error('Update failed');
                              await load();
                            } catch (e) {
                              setError(e?.message || 'Update error');
                            }
                          }} style={{ marginRight: 8 }}>Edit</button>
                          <button onClick={() => togglePhoto(it)} style={{ marginRight: 8 }}>{it.visible ? 'Hide' : 'Show'}</button>
                          <button onClick={() => removePhoto(it.id)} style={{ color: '#f55' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'items' && (
          <>
            <form onSubmit={saveItem} style={{ marginTop: 16, background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                <label>
                  <div>Media ID</div>
                  <input value={itemForm.media_id} onChange={(e) => setItemForm(f => ({ ...f, media_id: e.target.value }))} placeholder="e.g. 123" />
                  <div style={{ fontSize: 12, color: '#aaa' }}>Link a media record by ID</div>
                </label>
                <label>
                  <div>Title</div>
                  <input value={itemForm.title} onChange={(e) => setItemForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" />
                </label>
                <label>
                  <div>Description</div>
                  <input value={itemForm.description} onChange={(e) => setItemForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
                </label>
                <label>
                  <div>Sort Order</div>
                  <input type="number" value={itemForm.sort_order} onChange={(e) => setItemForm(f => ({ ...f, sort_order: parseInt(e.target.value || '0', 10) }))} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!itemForm.visible} onChange={(e) => setItemForm(f => ({ ...f, visible: e.target.checked }))} />
                  <span>Visible</span>
                </label>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button type="submit">{itemForm.id ? 'Update item' : 'Add item'}</button>
                {itemForm.id ? <button type="button" onClick={() => setItemForm({ id: 0, media_id: '', title: '', description: '', visible: true, sort_order: 0 })}>Cancel</button> : null}
              </div>
            </form>

            {loading ? (
              <div style={{ marginTop: 16 }}>Loading…</div>
            ) : error ? (
              <div style={{ marginTop: 16, color: '#f88' }}>{error}</div>
            ) : (
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#111' }}>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>ID</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Title</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Media</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Visible</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Sort</th>
                      <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.id}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.title || '—'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                          {it.media?.url ? <img src={it.media.url} alt={it.media?.alt || ''} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} /> : <span>—</span>}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.visible ? 'Yes' : 'No'}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{it.sort_order}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                          <button onClick={() => editItem(it)} style={{ marginRight: 8 }}>Edit</button>
                          <button onClick={() => toggleItem(it)} style={{ marginRight: 8 }}>{it.visible ? 'Hide' : 'Show'}</button>
                          <button onClick={() => removeItem(it.id)} style={{ color: '#f55' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {error && <div style={{ marginTop: 12, color: '#f88' }}>{error}</div>}
      </div>
    </AdminLayout>
  );
}
