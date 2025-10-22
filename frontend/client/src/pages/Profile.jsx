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

function OrdersBookingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch both orders and bookings
        const [ordersRes, bookingsRes] = await Promise.all([
          safeFetchJson(buildApiUrl('/orders/getOrders.php')),
          safeFetchJson(buildApiUrl('/bookings/getBookings.php'))
        ]);

        if (!mounted) return;

        const orders = ordersRes.data && Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const bookings = bookingsRes.data && Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

        // Combine orders and bookings into a single array
        const combinedItems = [];

        // Add orders with type 'order'
        orders.forEach(order => {
          // Parse service information
          let serviceInfo = null;
          let serviceAmount = order.total;
          try {
            if (order.items_json) {
              const items = JSON.parse(order.items_json);
              if (items && items.length > 0) {
                serviceInfo = items[0];
                serviceAmount = serviceInfo.amount || order.total;
              }
            }
          } catch (e) {
            console.error('Error parsing items_json:', e);
          }

          // Determine payment status
          const paidAmount = order.total;
          const isDeposit = serviceAmount > 0 && paidAmount < serviceAmount && paidAmount >= (serviceAmount * 0.4);
          const remainingAmount = Math.max(0, serviceAmount - paidAmount);

          combinedItems.push({
            ...order,
            type: 'order',
            id: order.order_id || order.id,
            date: order.created_at || order.date,
            amount: order.total,
            service: serviceInfo?.name || 'Order',
            payment_status: order.status,
            service_amount: serviceAmount,
            remaining_amount: remainingAmount,
            is_deposit: isDeposit,
            is_full_payment: paidAmount >= serviceAmount
          });
        });

        // Add bookings with type 'booking'
        bookings.forEach(booking => {
          combinedItems.push({
            ...booking,
            type: 'booking',
            id: booking.id,
            date: booking.date,
            amount: booking.amount || 0,
            service: booking.service,
            payment_status: booking.payment_option || 'pending'
          });
        });

        // Sort by date (newest first)
        combinedItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        setItems(combinedItems);
      } catch (error) {
        console.error('Error fetching orders and bookings:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status, item) => {
    if (item?.type === 'order') {
      if (item.is_full_payment) return 'text-green-400';
      if (item.is_deposit) return 'text-yellow-400';
      return 'text-gray-400';
    }
    
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div>
      <SectionHeader title="Orders & Bookings" subtitle="Your orders and service bookings" />
      {loading ? (
        <div className="text-gray-400">Loading orders and bookings…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No orders or bookings yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={`${item.type}-${item.id}-${index}`} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'order' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {item.type === 'order' ? 'Order' : 'Booking'}
                    </span>
                    <span className="text-sm text-gray-400">#{item.id}</span>
                  </div>
                  
                  <h3 className="font-medium text-white mb-1">
                    {item.service || (item.type === 'order' ? 'Order' : 'Service Booking')}
                  </h3>
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Date: {formatDate(item.date)}</div>
                    {item.time && <div>Time: {item.time}</div>}
                    {item.customer_name && <div>Customer: {item.customer_name}</div>}
                  </div>
                </div>
                
                <div className="text-right">
                  {item.amount > 0 && (
                    <div className="font-semibold text-lg mb-1">
                      R {Number(item.amount).toFixed(2)}
                      {item.is_deposit && item.remaining_amount > 0 && (
                        <div className="text-sm text-yellow-400">
                          (Remaining: R {item.remaining_amount.toFixed(2)})
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`text-xs uppercase tracking-wide ${getStatusColor(item.payment_status, item)}`}>
                    {item.type === 'order' && item.is_full_payment ? 'Paid in Full' :
                     item.type === 'order' && item.is_deposit ? 'Deposit Paid' :
                     item.payment_status || 'pending'}
                  </div>
                </div>
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
    { key: "orders-bookings", label: "Orders & Bookings", node: <OrdersBookingsTab /> },
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
