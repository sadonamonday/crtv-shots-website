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
        // Verify authenticated admin via backend
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

function Table({ items, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#111' }}>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Type</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Customer</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Email</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Service</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Date & Time</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Amount</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Payment</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Status</th>
            <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #222' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => {
            // Determine payment type and color based on order data
            let paymentType = 'Pending';
            let paymentColor = '#9ca3af';
            
            if (b.type === 'order') {
              if (b.is_full_payment) {
                paymentType = 'Paid in Full';
                paymentColor = '#4ade80';
              } else if (b.is_deposit) {
                paymentType = 'Deposit Paid';
                paymentColor = '#fbbf24';
              }
            } else {
              // For bookings
              paymentType = b.paymentType === 'deposit' ? 'Deposit (50%)' : 
                           b.paymentType === 'full' ? 'Full Payment' : 
                           b.paymentType || 'Pending';
              paymentColor = b.paymentType === 'deposit' ? '#fbbf24' : 
                            b.paymentType === 'full' ? '#4ade80' : '#9ca3af';
            }
            
            return (
              <tr key={b.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: b.type === 'order' ? '#1e40af' : '#059669',
                    color: 'white'
                  }}>
                    {b.type === 'order' ? 'ORDER' : 'BOOKING'}
                  </span>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.id}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.customer}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.email || (b.type === 'order' ? b.customerEmail : '')}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{b.service}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  {b.date}{b.time ? ` ${b.time}` : ''}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {typeof b.amount === 'number' ? `R${b.amount.toFixed(2)}` : ''}
                    </div>
                    {b.type === 'order' && b.is_deposit && b.remaining_amount > 0 && (
                      <div style={{ fontSize: '12px', color: '#fbbf24' }}>
                        Remaining: R{b.remaining_amount.toFixed(2)}
                      </div>
                    )}
                    {b.type === 'order' && b.service_amount && b.service_amount !== b.amount && (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Total: R{b.service_amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  <span style={{ color: paymentColor, fontWeight: 'bold' }}>
                    {paymentType}
                  </span>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  <span style={{
                    color: b.status === 'confirmed' ? '#4ade80' : 
                           b.status === 'pending' ? '#fbbf24' : 
                           b.status === 'cancelled' ? '#f87171' : '#9ca3af'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #222' }}>
                  <button onClick={() => onEdit(b)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => onDelete(b.id)} style={{ color: '#f55' }}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminBookings() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ id: '', customer: '', service: '', date: '', status: 'pending' });
  const [filters, setFilters] = useState({ status: '', email: '', date_from: '', date_to: '' });

  const load = async (f = filters) => {
    try {
      // Fetch both bookings and paid orders
      const [bookingsRes, ordersRes] = await Promise.all([
        fetch(buildApiUrl('/bookings/getBookings.php?admin=1'), { credentials: 'include' }),
        fetch(buildApiUrl('/orders/getOrders.php?admin=1&status=paid'), { credentials: 'include' })
      ]);

      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      // Combine bookings and paid orders
      const combinedItems = [];

      // Add bookings
      if (Array.isArray(bookings)) {
        bookings.forEach(booking => {
          combinedItems.push({
            ...booking,
            type: 'booking',
            id: booking.id,
            customer: booking.customer || booking.customerName,
            service: booking.service,
            date: booking.date,
            time: booking.time,
            status: booking.status,
            amount: booking.amount || 0,
            paymentType: booking.paymentOption || 'pending'
          });
        });
      }

      // Add paid orders as bookings
      if (Array.isArray(orders)) {
        orders.forEach(order => {
          // Extract service name from items_json
          let serviceName = 'Order';
          let serviceAmount = 0;
          try {
            if (order.items_json) {
              const items = JSON.parse(order.items_json);
              if (items && items.length > 0) {
                serviceName = items[0].name || items[0].title || 'Service';
                serviceAmount = items[0].amount || 0;
              }
            }
          } catch (e) {
            console.error('Error parsing items_json:', e);
          }

          const paidAmount = order.total || 0;
          const isDeposit = serviceAmount > 0 && paidAmount < serviceAmount && paidAmount >= (serviceAmount * 0.4);
          const isFullPayment = paidAmount >= serviceAmount;
          const remainingAmount = Math.max(0, serviceAmount - paidAmount);
          
          combinedItems.push({
            ...order,
            type: 'order',
            id: order.order_id || order.id,
            customer: order.customerName || order.customer_name,
            service: serviceName,
            date: order.created_at || order.createdAt,
            time: null,
            status: 'confirmed',
            amount: paidAmount,
            service_amount: serviceAmount,
            remaining_amount: remainingAmount,
            paymentType: isDeposit ? 'deposit' : 'full',
            is_deposit: isDeposit,
            is_full_payment: isFullPayment
          });
        });
      }

      // Sort by date (newest first)
      combinedItems.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log('Loaded bookings:', bookings);
      console.log('Loaded orders:', orders);
      console.log('Combined items:', combinedItems);
      
      setItems(combinedItems);
    } catch (e) {
      console.error('Error loading bookings and orders:', e);
      setItems([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
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
        const response = await fetch(buildApiUrl('/bookings/updateBooking.php'), {
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
        
        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            setItems((prev) => prev.map((it) => it.id === form.id ? form : it));
            setForm({ id: '', customer: '', service: '', date: '', status: 'pending' });
            alert('Booking updated successfully!');
          } else {
            alert('Failed to update booking');
          }
        } else {
          alert('Failed to update booking');
        }
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
        
        if (res.ok) {
          const created = await res.json().catch(() => null);
          if (created && created.id) {
            setItems((prev) => [{ id: created.id, customer: created.name, service: created.service, date: `${created.date}${created.time ? ' ' + created.time : ''}`, status: created.status }, ...prev]);
            alert('Booking created successfully!');
          } else {
            alert('Failed to create booking');
          }
        } else {
          const error = await res.json().catch(() => ({ error: 'Failed to create booking' }));
          alert(error.error || 'Failed to create booking');
        }
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      alert('An error occurred while processing the booking');
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
    <AdminLayout title="Bookings & Orders">
      <div style={{ padding: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ margin: 0 }}>Bookings & Orders</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 12 }}>Dashboard</Link>
            <Link to="/admin/availability" style={{ color: '#06d6a0' }}>Availability</Link>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={(e)=>{e.preventDefault(); load(filters);}} style={{ marginTop: 16, background: '#101010', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <label>
              <div>Status</div>
              <select value={filters.status} onChange={(e)=>setFilters({ ...filters, status: e.target.value })}>
                <option value="">Any</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label>
              <div>Customer Email</div>
              <input type="email" placeholder="email@example.com" value={filters.email} onChange={(e)=>setFilters({ ...filters, email: e.target.value })} />
            </label>
            <label>
              <div>Date from</div>
              <input type="date" value={filters.date_from} onChange={(e)=>setFilters({ ...filters, date_from: e.target.value })} />
            </label>
            <label>
              <div>Date to</div>
              <input type="date" value={filters.date_to} onChange={(e)=>setFilters({ ...filters, date_to: e.target.value })} />
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit" style={{ marginRight: 8 }}>Apply Filters</button>
            <button type="button" onClick={()=>{ setFilters({ status:'', email:'', date_from:'', date_to:''}); load({ status:'', email:'', date_from:'', date_to:''}); }}>Reset</button>
          </div>
        </form>

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
          {items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              background: '#1a1a1a', 
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>No Bookings or Orders Found</h3>
              <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>
                When customers make bookings or payments, they will appear here.
              </p>
              <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>This page shows:</p>
                <ul style={{ textAlign: 'left', display: 'inline-block', margin: '8px 0' }}>
                  <li>Regular service bookings</li>
                  <li>Paid orders (full payments)</li>
                  <li>Deposit payments with remaining balances</li>
                </ul>
              </div>
            </div>
          ) : (
            <Table items={items} onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
