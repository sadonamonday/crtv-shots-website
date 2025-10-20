import React, { useEffect, useMemo, useState } from "react";
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

  const days = useMemo(() => buildMonth(year, month), [year, month]);

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

  const changeMonth = (delta) => {
    let y = year, m = month + delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYear(y);
    setMonth(m);
  };

  return (
    <Guard>
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

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {days.map((d) => (
            <DayButton key={d} dateStr={d} selected={selectedDates.has(d)} onToggle={toggleDate} />)
          )}
        </div>

        <div style={{ marginTop: 16, opacity: 0.9 }}>
          Selected available dates: {Array.from(selectedDates).sort().join(', ') || 'None'}
        </div>
      </div>
    </Guard>
  );
}
