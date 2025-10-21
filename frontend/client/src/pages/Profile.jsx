import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";
import buildApiUrl from "../utils/api";

// Lightweight helper to fetch JSON safely
async function safeFetchJson(url, options = {}) {
  try {
    // Ensure cookies are sent for authenticated endpoints
    const res = await fetch(url, { credentials: 'include', ...options });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function PhotoTab() {
  const [preview, setPreview] = useState(() => localStorage.getItem("user_profile_photo") || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function onChoose(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(f);
    setMsg("");
  }

  async function onSave() {
    setSaving(true);
    setMsg("");
    try {
      // Persist locally for now (no backend endpoint provided)
      if (preview) localStorage.setItem("user_profile_photo", preview);
      // If a backend endpoint becomes available, uncomment and adapt:
      // const form = new FormData();
      // if (file) form.append('photo', file);
      // const { error } = await safeFetchJson(buildApiUrl('/users/updatePhoto.php'), { method: 'POST', body: form });
      // if (error) throw error;
      setMsg("Profile photo saved.");
    } catch (e) {
      setMsg("Failed to save photo. Try again later.");
    } finally {
      setSaving(false);
    }
  }

  function onRemove() {
    localStorage.removeItem("user_profile_photo");
    setPreview("");
    setFile(null);
    setMsg("Photo removed.");
  }

  return (
    <div>
      <SectionHeader title="Profile Photo" subtitle="Add or update your profile picture" />
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-600">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">No photo</span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={onChoose}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
          />
          <div className="mt-3 flex gap-3">
            <button
              onClick={onSave}
              disabled={saving || !preview}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {preview && (
              <button onClick={onRemove} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600">Remove</button>
            )}
          </div>
          {msg && <div className="mt-3 text-sm text-gray-300">{msg}</div>}
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Try backend first
      const { data, error } = await safeFetchJson(buildApiUrl('/orders/getOrders.php'));
      if (!mounted) return;
      if (data && Array.isArray(data)) {
        setItems(data);
      } else {
        // Fallback demo data
        const demo = [
          { id: "ord_101", date: "2025-09-12", total: 1499.0, status: "paid", items: 2 },
          { id: "ord_102", date: "2025-10-02", total: 799.0, status: "shipped", items: 1 }
        ];
        setItems(demo);
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <SectionHeader title="Your Orders" subtitle="Track your purchases" />
      {loading ? (
        <div className="text-gray-400">Loading orders…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No orders yet.</div>
      ) : (
        <div className="divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
          {items.map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between bg-gray-800">
              <div>
                <div className="font-medium">Order {o.id}</div>
                <div className="text-gray-400 text-sm">{o.date} · {o.items ?? 0} item(s)</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">R {Number(o.total || 0).toFixed(2)}</div>
                <div className="text-xs uppercase tracking-wide text-gray-400">{o.status || "pending"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await safeFetchJson(buildApiUrl('/bookings/getBookings.php'));
      if (!mounted) return;
      if (data && Array.isArray(data)) setItems(data);
      else
        setItems([
          { id: "bk_301", date: "2025-10-28", time: "14:00", service: "Promo Video", status: "pending" },
          { id: "bk_302", date: "2025-11-05", time: "10:00", service: "Event Coverage", status: "confirmed" }
        ]);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <SectionHeader title="Your Bookings" subtitle="Upcoming and past bookings" />
      {loading ? (
        <div className="text-gray-400">Loading bookings…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No bookings yet.</div>
      ) : (
        <div className="divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
          {items.map((b) => (
            <div key={b.id} className="p-4 flex items-center justify-between bg-gray-800">
              <div>
                <div className="font-medium">{b.service || "Booking"}</div>
                <div className="text-gray-400 text-sm">{b.date} {b.time ? `· ${b.time}` : ""}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-gray-400">{b.status || "pending"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const tabs = useMemo(() => [
    { key: "photo", label: "Profile Photo", node: <PhotoTab /> },
    { key: "orders", label: "Orders", node: <OrdersTab /> },
    { key: "bookings", label: "Bookings", node: <BookingsTab /> },
  ], []);
  const [active, setActive] = useState("photo");

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

          {/* Tabs */}
          <div className="border-b border-gray-800 mb-6 flex gap-2 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`px-4 py-2 rounded-t ${active === t.key ? "bg-gray-800 text-white" : "text-gray-300 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            {tabs.find(t => t.key === active)?.node}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
