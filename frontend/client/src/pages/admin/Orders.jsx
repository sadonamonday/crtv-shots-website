import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout.jsx";
import { listOrders, getOrder, updateOrder } from "../../api/orders";
import { formatZAR } from "../../utils/currency";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      // Admin view - show only paid orders from all users
      const res = await listOrders({ limit: 100, status: 'paid', q, admin: '1' });
      setOrders(res.items || res || []);
    } catch (e) { setError(String(e.message || e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [statusFilter, q]);

  async function openDetails(id) {
    setSelectedId(id);
    setDetailsLoading(true); setError("");
    try {
      const d = await getOrder(id);
      setDetails(d);
      setNotesDraft(d.notes || "");
      setStatusDraft(d.status || "pending");
    } catch (e) { setError(String(e.message || e)); }
    finally { setDetailsLoading(false); }
  }

  async function saveDetails() {
    if (!selectedId) return;
    try {
      const updated = await updateOrder(selectedId, { status: statusDraft, notes: notesDraft });
      // refresh list row
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, status: updated.status, notes: updated.notes, updatedAt: updated.updatedAt } : o));
      setDetails(updated);
    } catch (e) { setError(String(e.message || e)); }
  }

  const exportUrl = useMemo(() => {
    const p = new URLSearchParams();
    p.set('admin', '1'); // Always export all orders for admin
    if (statusFilter) p.set('status', statusFilter);
    if (q) p.set('q', q);
    return `/orders/exportOrders.php${p.toString() ? `?${p.toString()}` : ''}`;
  }, [statusFilter, q]);

  return (
    <AdminLayout title="Paid Orders">
      {error && <div style={{ color:'#f66', marginBottom:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:12 }}>
        <input placeholder="Search by name or email" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load} disabled={loading}>Refresh</button>
        <a href={exportUrl}><button type="button">Export CSV</button></a>
      </div>

      <div style={{ marginTop: 4, overflowX:'auto' }}>
        {loading ? <div>Loading...</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#111' }}>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Order ID</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Customer Name</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Customer Email</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Service/Items</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Amount Paid</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Payment Type</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Created</th>
              <th style={{ textAlign:'left', padding:8, borderBottom:'1px solid #222' }}>Actions</th>
            </tr></thead>
            <tbody>
              {orders.map(o => {
                // Extract service name from items_json
                let serviceName = 'Order';
                let serviceAmount = 0;
                try {
                  if (o.items_json) {
                    const items = JSON.parse(o.items_json);
                    if (items && items.length > 0) {
                      serviceName = items[0].name || items[0].title || 'Service';
                      serviceAmount = items[0].amount || 0;
                    }
                  }
                } catch (e) {
                  console.error('Error parsing items_json:', e);
                }
                
                // Determine payment type based on amount paid vs expected service amount
                const paidAmount = o.total || 0;
                const isDeposit = serviceAmount > 0 && paidAmount < serviceAmount && paidAmount >= (serviceAmount * 0.4);
                const paymentType = isDeposit ? 'Deposit (50%)' : 'Full Payment';
                const paymentTypeColor = isDeposit ? '#fbbf24' : '#4ade80';
                
                return (
                  <tr key={o.id}>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      {o.order_id || o.id}
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      {o.customerName || o.customer_name || ''}
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      {o.customerEmail || o.customer_email || ''}
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      {serviceName}
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      {formatZAR(paidAmount)}
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      <span style={{ color: paymentTypeColor, fontWeight: 'bold' }}>
                        {paymentType}
                      </span>
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      {o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleDateString() : ''}
                    </td>
                    <td style={{ padding:8, borderBottom:'1px solid #222' }}>
                      <button onClick={()=>openDetails(o.id)} style={{ marginRight:8 }}>Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedId && (
        <div style={{ marginTop:16, padding:16, border:'1px solid #222', borderRadius:12, background:'#111' }}>
          {detailsLoading ? <div>Loading details...</div> : details ? (
              <div style={{ display:'grid', gap:12 }}>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
                  <div><strong>Order #{details.order_id || details.id}</strong></div>
                  <div>Customer: {details.customerName || details.customer_name} {details.customerEmail && `(${details.customerEmail})`}</div>
                  <div>Total: {formatZAR(details.total)}</div>
                  <div>Status:
                    <select value={statusDraft} onChange={e=>setStatusDraft(e.target.value)} style={{ marginLeft:6 }}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

              {details.user && (
                <div>
                  <div style={{ opacity:0.8 }}>Linked User</div>
                  <div>ID: {details.user.id} · {details.user.name} · {details.user.email}</div>
                </div>
              )}

              <div>
                <div style={{ opacity:0.8 }}>Items</div>
                <ul>
                  {(details.items || []).map((it, idx) => (
                    <li key={idx}>
                      {it.title || it.name || it.productTitle || 'Item'} × {it.quantity || it.qty || 1}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ opacity:0.8, marginBottom:6 }}>Notes</div>
                <textarea value={notesDraft} onChange={e=>setNotesDraft(e.target.value)} rows={3} style={{ width:'100%' }} />
                <div style={{ marginTop:8 }}>
                  <button onClick={saveDetails}>Save</button>
                </div>
              </div>

              <div>
                <div style={{ opacity:0.8 }}>Payments</div>
                {(details.payments && details.payments.length) ? (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign:'left', padding:6, borderBottom:'1px solid #222' }}>ID</th>
                        <th style={{ textAlign:'left', padding:6, borderBottom:'1px solid #222' }}>Amount</th>
                        <th style={{ textAlign:'left', padding:6, borderBottom:'1px solid #222' }}>Provider</th>
                        <th style={{ textAlign:'left', padding:6, borderBottom:'1px solid #222' }}>Provider Txn</th>
                        <th style={{ textAlign:'left', padding:6, borderBottom:'1px solid #222' }}>Status</th>
                        <th style={{ textAlign:'left', padding:6, borderBottom:'1px solid #222' }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.payments.map(p => (
                        <tr key={p.id}>
                          <td style={{ padding:6, borderBottom:'1px solid #222' }}>{p.id}</td>
                          <td style={{ padding:6, borderBottom:'1px solid #222' }}>{formatZAR(p.amount)}</td>
                          <td style={{ padding:6, borderBottom:'1px solid #222' }}>{p.provider}</td>
                          <td style={{ padding:6, borderBottom:'1px solid #222' }}>{p.providerTxnId}</td>
                          <td style={{ padding:6, borderBottom:'1px solid #222' }}>{p.status}</td>
                          <td style={{ padding:6, borderBottom:'1px solid #222' }}>{p.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (<div style={{ opacity:0.7 }}>No payments</div>)}
              </div>

              <div>
                <button type="button" onClick={()=>{ setSelectedId(null); setDetails(null); }}>Close</button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AdminLayout>
  );
}
