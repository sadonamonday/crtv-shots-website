import React, { useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

function Kpi({ label, value, sub }) {
  return (
    <div style={{ background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function MiniChart({ points = [] }) {
  const d = useMemo(() => {
    if (!points.length) return '';
    const w = 200, h = 60;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const norm = (v) => max === min ? h/2 : h - ((v - min) / (max - min)) * h;
    return points.map((v, i) => `${(i/(points.length-1))*w},${norm(v)}`).join(' ');
  }, [points]);
  return (
    <svg width={200} height={60} style={{ display: 'block' }}>
      <polyline fill="none" stroke="#06d6a0" strokeWidth="2" points={d} />
    </svg>
  );
}

export default function AdminDashboard() {
  // Mock stats
  const sales = 12450;
  const orders = 37;
  const bookings = 12;
  const week = [8, 12, 9, 14, 18, 16, 20];

  return (
    <AdminLayout title="Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        <Kpi label="Total Sales (30d)" value={`$${sales.toLocaleString()}`} sub="↑ 12% vs prev 30d" />
        <Kpi label="Orders (7d)" value={orders} sub="Including refunds" />
        <Kpi label="Bookings (7d)" value={bookings} sub="Pending + confirmed" />
        <div style={{ background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Sales (7d)</div>
          <MiniChart points={week} />
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        <div style={{ background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Links</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="/admin/orders" style={{ color: '#06d6a0' }}>Manage Orders</a>
            <a href="/admin/bookings" style={{ color: '#06d6a0' }}>Manage Bookings</a>
            <a href="/admin/products-services" style={{ color: '#06d6a0' }}>Products & Services</a>
            <a href="/admin/content" style={{ color: '#06d6a0' }}>Content Management</a>
            <a href="/admin/reviews" style={{ color: '#06d6a0' }}>Reviews & Testimonials</a>
            <a href="/admin/payments" style={{ color: '#06d6a0' }}>Payments</a>
            <a href="/admin/analytics" style={{ color: '#06d6a0' }}>Analytics</a>
            <a href="/admin/promotions" style={{ color: '#06d6a0' }}>Promotions</a>
            <a href="/admin/availability" style={{ color: '#06d6a0' }}>Availability</a>
          </div>
        </div>
        <div style={{ background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Orders</div>
          <div style={{ opacity: 0.9, fontSize: 14 }}>Recent orders will appear here.</div>
        </div>
        <div style={{ background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Bookings</div>
          <div style={{ opacity: 0.9, fontSize: 14 }}>Latest bookings and approvals.</div>
        </div>
        <div style={{ background: '#121212', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Promotions</div>
          <div style={{ opacity: 0.9, fontSize: 14 }}>Active campaigns and coupons.</div>
        </div>
      </div>
    </AdminLayout>
  );
}
