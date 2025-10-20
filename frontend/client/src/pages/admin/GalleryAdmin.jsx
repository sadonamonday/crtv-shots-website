import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import buildApiUrl from "../../utils/api";

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
          const isAdmin = Boolean(data?.isAdmin || data?.role === 'admin');
          if (!cancelled) setAllowed(isAdmin);
        } else {
          const isAdminLS = localStorage.getItem('isAdmin') === 'true';
          if (!cancelled) setAllowed(isAdminLS);
        }
      } catch {
        const isAdminLS = localStorage.getItem('isAdmin') === 'true';
        if (!cancelled) setAllowed(isAdminLS);
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
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/gallery/list.php?all=1'), { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
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
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    if (title) form.append('title', title);
    try {
      const res = await fetch(buildApiUrl('/gallery/upload.php'), { method: 'POST', body: form, credentials: 'include' });
      if (!res.ok) throw new Error('Upload failed');
      setFile(null);
      setTitle('');
      await load();
    } catch (e) {
      setError(e?.message || 'Upload error');
    }
  };

  const toggle = async (it) => {
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

  const removeItem = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const res = await fetch(buildApiUrl('/gallery/delete.php?id=' + encodeURIComponent(id)), { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch (e) {
      setError(e?.message || 'Delete error');
    }
  };

  return (
    <Guard>
      <div style={{ padding: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Gallery Manager</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 12 }}>Dashboard</Link>
          </div>
        </div>

        <form onSubmit={upload} style={{ marginTop: 16, background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <label>
              <div>Image</div>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </label>
            <label>
              <div>Title</div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">Upload</button>
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
                {items.map((it) => (
                  <Row key={it.id} item={it} onToggle={toggle} onDelete={removeItem} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Guard>
  );
}
