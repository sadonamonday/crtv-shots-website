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
        // Verify authenticated admin via backend
        const res = await fetch(buildApiUrl('/auth/me.php'), { credentials: 'include' });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const isAdmin = Boolean(data?.is_admin || data?.role === 'admin');
          if (!cancelled) setAllowed(isAdmin);
        } else {
          // Fallback to localStorage flag for dev/demo
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

function Table({ items, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#111' }}>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Customer</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Service</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Date</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Status</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.id}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.customer}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.service}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.date}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.status}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                <button onClick={() => onEdit(b)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => onDelete(b.id)} style={{ color: '#f55' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminBookings() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ id: '', customer: '', service: '', date: '', status: 'pending' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(buildApiUrl('/bookings/getBookings.php?admin=1'), { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load bookings');
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setItems(data);
      } catch (e) {
        // keep empty on failure
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await fetch(buildApiUrl('/bookings/updateBooking.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: form.id,
            customer: form.customer,
            service: form.service,
            date: form.date,
            status: form.status,
          }),
          credentials: 'include',
        });
        setItems((prev) => prev.map((it) => it.id === form.id ? form : it));
      } else {
        const res = await fetch(buildApiUrl('/bookings/createBookings.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.customer,
            service: form.service,
            date: form.date?.slice(0,10) || form.date,
            time: form.date?.slice(11,16) || '',
          }),
          credentials: 'include',
        });
        const created = await res.json().catch(() => null);
        if (created && created.id) {
          setItems((prev) => [{ id: created.id, customer: created.name, service: created.service, date: `${created.date}${created.time ? ' ' + created.time : ''}`, status: created.status }, ...prev]);
        }
      }
    } catch (err) {
      // swallow for now
    }
    setForm({ id: '', customer: '', service: '', date: '', status: 'pending' });
  };

  const onEdit = (b) => setForm(b);
  const onDelete = async (id) => {
    try {
      await fetch(buildApiUrl('/bookings/cancelBooking.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      });
    } catch {}
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <Guard>
      <div style={{ padding: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Bookings</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 12 }}>Dashboard</Link>
            <Link to="/admin/availability" style={{ color: '#06d6a0' }}>Availability</Link>
          </div>
        </div>

        <form onSubmit={submit} style={{ marginTop: 16, background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <label>
              <div>Customer</div>
              <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required />
            </label>
            <label>
              <div>Service</div>
              <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required />
            </label>
            <label>
              <div>Date & Time</div>
              <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label>
              <div>Status</div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">{form.id ? 'Update Booking' : 'Create Booking'}</button>
            {form.id && (
              <button type="button" onClick={() => setForm({ id: '', customer: '', service: '', date: '', status: 'pending' })} style={{ marginLeft: 8 }}>Cancel</button>
            )}
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          <Table items={items} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </Guard>
  );
}
