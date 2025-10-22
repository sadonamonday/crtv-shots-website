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
          const isAdmin = Boolean(data?.is_admin || data?.role === 'admin');
          if (!cancelled) setAllowed(isAdmin);
        } else {
          const isAdminLS = localStorage.getItem('is_admin') === 'true';
          if (!cancelled) setAllowed(isAdminLS);
        }
      } catch {
        const isAdminLS = localStorage.getItem('is_admin') === 'true';
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
        <Link to="/admin/login" style={{ color: '#06d6a0' }}>Go to admin login</Link>
      </p>
    </div>
  );
  return children;
}

function CouponsTable({ rows, onEdit, onToggle }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#111' }}>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Code</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Type</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Value</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Active</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Window</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Usage</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{c.code}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{c.type}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{c.type === 'percent' ? `${c.value}%` : `R${Number(c.value || 0).toFixed(2)}`}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{c.active ? 'Yes' : 'No'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{[c.startsAt || '', c.expiresAt || ''].filter(Boolean).join(' → ')}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{`${c.usedCount || 0}${c.maxUses ? ` / ${c.maxUses}` : ''}`}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                <button onClick={() => onEdit(c)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => onToggle(c)}>{c.active ? 'Deactivate' : 'Activate'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ code: '', active: '' });
  const [form, setForm] = useState({ id: '', code: '', type: 'percent', value: '', description: '', startsAt: '', expiresAt: '', maxUses: '', active: true });

  const load = async (f = filters) => {
    const params = new URLSearchParams();
    if (f.code) params.set('code', f.code.trim());
    if (f.active !== '') params.set('active', f.active);
    const res = await fetch(buildApiUrl(`/coupons/list.php?${params.toString()}`), { credentials: 'include' });
    const data = await res.json().catch(()=>[]);
    if (Array.isArray(data)) setItems(data);
  };

  useEffect(() => { load().catch(()=>{}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      id: form.id || undefined,
      code: form.code,
      type: form.type,
      value: Number(form.value || 0),
      description: form.description,
      startsAt: form.startsAt || undefined,
      expiresAt: form.expiresAt || undefined,
      maxUses: form.maxUses === '' ? null : Number(form.maxUses),
      active: !!form.active,
    };
    const res = await fetch(buildApiUrl('/coupons/save.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await load();
      setForm({ id: '', code: '', type: 'percent', value: '', description: '', startsAt: '', expiresAt: '', maxUses: '', active: true });
    }
  };

  const onEdit = (c) => {
    setForm({
      id: c.id,
      code: c.code || '',
      type: c.type || 'percent',
      value: c.value ?? '',
      description: c.description || '',
      startsAt: c.startsAt ? c.startsAt.replace(' ', 'T').slice(0,16) : '',
      expiresAt: c.expiresAt ? c.expiresAt.replace(' ', 'T').slice(0,16) : '',
      maxUses: c.maxUses ?? '',
      active: !!c.active,
    });
  };

  const onToggle = async (c) => {
    await fetch(buildApiUrl('/coupons/toggle.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: c.id, active: !c.active }),
    }).catch(()=>{});
    await load();
  };

  return (
    <AdminLayout title="Coupons">
      <div style={{ padding: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Coupons</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 12 }}>Dashboard</Link>
            <Link to="/admin/promotions" style={{ color: '#06d6a0' }}>Promotions</Link>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={(e)=>{ e.preventDefault(); load(filters); }} style={{ marginTop: 16, background: '#101010', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <label>
              <div>Code</div>
              <input value={filters.code} onChange={(e)=>setFilters({ ...filters, code: e.target.value })} placeholder="SAVE10" />
            </label>
            <label>
              <div>Active</div>
              <select value={filters.active} onChange={(e)=>setFilters({ ...filters, active: e.target.value })}>
                <option value="">Any</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" style={{ marginRight: 8 }}>Apply Filters</button>
            <button type="button" onClick={()=>{ setFilters({ code:'', active:''}); load({ code:'', active:''}); }}>Reset</button>
          </div>
        </form>

        {/* Form */}
        <form onSubmit={submit} style={{ marginTop: 16, background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <label>
              <div>Code</div>
              <input required value={form.code} onChange={(e)=>setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" />
            </label>
            <label>
              <div>Type</div>
              <select value={form.type} onChange={(e)=>setForm({ ...form, type: e.target.value })}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <label>
              <div>Value</div>
              <input type="number" step="0.01" value={form.value} onChange={(e)=>setForm({ ...form, value: e.target.value })} placeholder="10" />
            </label>
            <label>
              <div>Max Uses</div>
              <input type="number" step="1" min="0" value={form.maxUses} onChange={(e)=>setForm({ ...form, maxUses: e.target.value })} placeholder="e.g. 100" />
            </label>
            <label>
              <div>Starts At</div>
              <input type="datetime-local" value={form.startsAt} onChange={(e)=>setForm({ ...form, startsAt: e.target.value })} />
            </label>
            <label>
              <div>Expires At</div>
              <input type="datetime-local" value={form.expiresAt} onChange={(e)=>setForm({ ...form, expiresAt: e.target.value })} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={!!form.active} onChange={(e)=>setForm({ ...form, active: e.target.checked })} /> Active
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <div>Description</div>
              <textarea rows={3} value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">{form.id ? 'Update Coupon' : 'Create Coupon'}</button>
            {form.id && (
              <button type="button" onClick={()=>setForm({ id: '', code: '', type: 'percent', value: '', description: '', startsAt: '', expiresAt: '', maxUses: '', active: true })} style={{ marginLeft: 8 }}>Cancel</button>
            )}
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          <CouponsTable rows={items} onEdit={onEdit} onToggle={onToggle} />
        </div>
      </div>
    </AdminLayout>
  );
}
