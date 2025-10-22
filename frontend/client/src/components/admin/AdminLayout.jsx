import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import buildApiUrl from "../../utils/api.js";

function NavItem({ to, label, emoji }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        borderRadius: 8,
        color: active ? '#0ee7b7' : '#cfd8dc',
        background: active ? 'rgba(6,214,160,0.08)' : 'transparent',
        textDecoration: 'none', fontWeight: active ? 700 : 500
      }}
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const proceed = () => { if (isMounted) setChecking(false); };

    // If localStorage says we're authenticated, trust it but also silently verify session
    let hasLocal = false;
    try { hasLocal = localStorage.getItem("admin_auth") === "true"; } catch (_) {}

    const verifySession = async () => {
      try {
        const res = await fetch(buildApiUrl("/auth/me.php"), { credentials: "include" });
        const data = await res.json();
        if (data && data.authenticated && data.is_admin && data.role === 'admin') {
          try { localStorage.setItem("admin_auth", "true"); } catch (_) {}
          proceed();
        } else {
          // User is not authenticated or not an admin
          try { localStorage.removeItem("admin_auth"); } catch (_) {}
          try { localStorage.removeItem("isLoggedIn"); } catch (_) {}
          navigate("/login", { replace: true });
        }
      } catch (e) {
        // On network error, redirect to login
        try { localStorage.removeItem("admin_auth"); } catch (_) {}
        try { localStorage.removeItem("isLoggedIn"); } catch (_) {}
        navigate("/login", { replace: true });
      }
    };

    if (hasLocal) {
      // Show immediately but verify in background
      setChecking(false);
      verifySession();
    } else {
      // No local flag, must verify with server
      verifySession();
    }

    return () => { isMounted = false; };
  }, [navigate]);

  const handleLogout = async () => {
    try { localStorage.removeItem("admin_auth"); } catch (_) {}
    try { localStorage.removeItem("isLoggedIn"); } catch (_) {}
    try { await fetch(buildApiUrl("/config/logout.php"), { method: "POST", credentials: "include" }); } catch (_) {}
    navigate("/login");
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#0b0b0b', color: '#fff' }}>
        <div>Checking session…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100dvh', background: '#0b0b0b', color: '#fff' }}>
      <aside style={{ borderRight: '1px solid #1e1e1e', padding: 16, background: '#111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#06d6a0,#118ab2)' }} />
          <div style={{ fontSize: 16, fontWeight: 800 }}>Admin</div>
        </div>
        <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 14 }}>sidebar</div>
        <nav style={{ display: 'grid', gap: 6 }}>
          <NavItem to="/admin" label="Dashboard" emoji="📊" />
          <NavItem to="/admin/orders" label="Orders" emoji="🧾" />
          <NavItem to="/admin/bookings" label="Bookings" emoji="🗓️" />
          <NavItem to="/admin/products" label="Products" emoji="🧺" />
          <NavItem to="/admin/categories" label="Categories" emoji="🗂️" />
          <NavItem to="/admin/services" label="Services" emoji="🛠️" />
          <NavItem to="/admin/content" label="Content" emoji="📝" />
            <NavItem to="/admin/gallery" label="Gallery" emoji="🖼️" />
          <NavItem to="/admin/reviews" label="Reviews" emoji="⭐" />
          <NavItem to="/admin/payments" label="Payments" emoji="💳" />
          <NavItem to="/admin/analytics" label="Analytics" emoji="📈" />
          <NavItem to="/admin/promotions" label="Promotions" emoji="🏷️" />
        </nav>
        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
          <a href="/" style={{ color: '#9fb3c8' }}>← View site</a>
        </div>
      </aside>
      <main>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#0e0e0e', borderBottom: '1px solid #1e1e1e', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>{title || 'Admin'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, opacity: 0.9 }}>
            <span>Logged in as Admin</span>
            <button onClick={handleLogout} style={{ color: '#06d6a0', background: 'transparent', border: 'none', cursor: 'pointer' }}>Logout</button>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
