import React, { useEffect, useMemo, useState } from "react";
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

function DayButton({ dateStr, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(dateStr)}
      style={{
        padding: '8px 10px',
        borderRadius: 8,
        border: selected ? '1px solid #06d6a0' : '1px solid #333',
        background: selected ? '#0b3d31' : '#121212',
        color: '#fff',
        cursor: 'pointer'
      }}
      aria-pressed={selected}
    >
      {dateStr}
    </button>
  );
}

function buildMonth(year, month) {
  // month: 0-11
  const first = new Date(year, month, 1);
  const days = [];
  let d = new Date(first);
  while (d.getMonth() === month) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function Availability() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [selectedDates, setSelectedDates] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('available_dates') || '[]');
      return new Set(saved);
    } catch {
      return new Set();
    }
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = useMemo(() => buildMonth(year, month), [year, month]);

  // Load existing availability from backend on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(buildApiUrl('/bookings/getAvailability.php'), {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          const dates = Array.isArray(data?.dates) ? data.dates : [];
          if (!cancelled) setSelectedDates(new Set(dates));
          console.log('Loaded availability dates:', dates);
        } else {
          console.error('Failed to load availability:', res.status);
        }
      } catch (e) {
        console.error('Error loading availability:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem('available_dates', JSON.stringify(Array.from(selectedDates)));
  }, [selectedDates]);

  const toggleDate = (dateStr) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(buildApiUrl('/bookings/setAvailability.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: Array.from(selectedDates) }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save availability');
      }
      
      const result = await res.json();
      console.log('Availability saved successfully:', result);
      
      // Show success feedback
      setSuccess(`Availability updated successfully! ${result.saved || selectedDates.size} dates saved.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (e) {
      console.error('Save availability error:', e);
      setError(e.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const changeMonth = (delta) => {
    let y = year, m = month + delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYear(y);
    setMonth(m);
  };

  return (
    <Guard>
      <AdminLayout title="Availability">
        <div style={{ padding: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Availability</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 12 }}>Dashboard</Link>
            <Link to="/admin/bookings" style={{ color: '#06d6a0' }}>Bookings</Link>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => changeMonth(-1)}>{'<'}</button>
          <div style={{ fontWeight: 700 }}>
            {new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => changeMonth(1)}>{'>'}</button>
        </div>

        {loading ? (
          <div style={{ marginTop: 16 }}>Loading availability…</div>
        ) : (
          <>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              {days.map((d) => (
                <DayButton key={d} dateStr={d} selected={selectedDates.has(d)} onToggle={toggleDate} />)
              )}
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={save} disabled={saving} style={{ background: '#06d6a0', color: '#000', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save availability'}
              </button>
              {error && <span style={{ color: '#f88' }}>{error}</span>}
              {success && <span style={{ color: '#4ade80' }}>{success}</span>}
            </div>

            <div style={{ marginTop: 16, opacity: 0.9 }}>
              Selected available dates: {Array.from(selectedDates).sort().join(', ') || 'None'}
            </div>
          </>
        )}
        </div>
      </AdminLayout>
    </Guard>
  );
}
