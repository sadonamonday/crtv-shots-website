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
    <div style={{ overflowX: 'auto', maxWidth: '100%', fontSize: '0.85rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
        <thead>
          <tr style={{ background: '#111' }}>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Type</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>ID</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Customer</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Email</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Service</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Date & Time</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Amount</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Payment</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Status</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>Actions</th>
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
                <td style={{ padding: 6, borderBottom: '1px solid #222' }}>
                  <span style={{
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: b.type === 'order' ? '#1e40af' : '#059669',
                    color: 'white'
                  }}>
                    {b.type === 'order' ? 'ORDER' : 'BOOKING'}
                  </span>
                </td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>{b.id}</td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.customer}</td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.email || (b.type === 'order' ? b.customerEmail : '')}</td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.service}</td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>
                  {b.date}{b.time ? ` ${b.time}` : ''}
                </td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {typeof b.amount === 'number' ? `R${b.amount.toFixed(2)}` : ''}
                    </div>
                    {b.type === 'order' && b.is_deposit && b.remaining_amount > 0 && (
                      <div style={{ fontSize: '10px', color: '#fbbf24' }}>
                        Remaining: R{b.remaining_amount.toFixed(2)}
                      </div>
                    )}
                    {b.type === 'order' && b.service_amount && b.service_amount !== b.amount && (
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                        Total: R{b.service_amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>
                  <span style={{ color: paymentColor, fontWeight: 'bold' }}>
                    {paymentType}
                  </span>
                </td>
                <td style={{ padding: 6, borderBottom: '1px solid #222', fontSize: '0.8rem' }}>
                  <span style={{
                    color: b.status === 'confirmed' ? '#4ade80' : 
                           b.status === 'pending' ? '#fbbf24' : 
                           b.status === 'cancelled' ? '#f87171' : '#9ca3af'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: 6, borderBottom: '1px solid #222' }}>
                  <button onClick={() => onEdit(b)} style={{ marginRight: 4, fontSize: '0.75rem', padding: '2px 6px' }}>Edit</button>
                  <button onClick={() => onDelete(b.id)} style={{ color: '#f55', fontSize: '0.75rem', padding: '2px 6px' }}>Delete</button>
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
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    id: '', 
    customer: '', 
    email: '', 
    phone: '', 
    service: '', 
    date: '', 
    time: '',
    notes: '',
    amount: 0,
    payment_option: '',
    status: 'pending' 
  });
  const [filters, setFilters] = useState({ status: '', email: '', date_from: '', date_to: '' });

  const load = async (f = filters) => {
    if (loading) return; // Prevent multiple simultaneous requests
    setLoading(true);
    try {
      console.log('Loading bookings and orders...');
      // Fetch both bookings and paid orders
      const [bookingsRes, ordersRes] = await Promise.all([
        fetch(buildApiUrl('/bookings/getBookings.php?admin=1'), { credentials: 'include' }),
        fetch(buildApiUrl('/orders/getOrders.php?admin=1'), { credentials: 'include' })
      ]);
      
      console.log('Bookings response status:', bookingsRes.status);
      console.log('Orders response status:', ordersRes.status);

      if (!bookingsRes.ok) {
        console.error('Bookings fetch failed:', bookingsRes.status, bookingsRes.statusText);
      }
      if (!ordersRes.ok) {
        console.error('Orders fetch failed:', ordersRes.status, ordersRes.statusText);
      }
      
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
            customer: booking.customer || booking.customerName || booking.customer_name,
            email: booking.email || booking.customer_email,
            phone: booking.phone || booking.customer_phone,
            service: booking.service,
            date: booking.date,
            time: booking.time,
            notes: booking.notes,
            amount: booking.amount || 0,
            payment_option: booking.paymentOption || booking.payment_option || 'pending',
            status: booking.status
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
            email: order.customer_email || order.email,
            phone: order.customer_phone || order.phone,
            service: serviceName,
            date: order.created_at || order.createdAt,
            time: null,
            notes: order.notes || '',
            amount: paidAmount,
            service_amount: serviceAmount,
            remaining_amount: remainingAmount,
            payment_option: isDeposit ? 'deposit' : 'full',
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
      console.log('Total items to display:', combinedItems.length);
      
      setItems(combinedItems);
    } catch (e) {
      console.error('Error loading bookings and orders:', e);
      setItems([]);
    } finally {
      setLoading(false);
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
        // Check if this is an order or booking
        const isOrder = form.type === 'order';
        const endpoint = isOrder ? '/orders/updateOrder.php' : '/bookings/updateBooking.php';
        
        // Prepare data based on type
        const requestData = isOrder ? {
          id: form.id,
          customerName: form.customer,
          customerEmail: form.email,
          customerPhone: form.phone,
          total: form.amount,
          status: form.status,
          notes: form.notes,
        } : {
          id: form.id,
          customer: form.customer,
          email: form.email,
          phone: form.phone,
          service: form.service,
          date: form.date,
          time: form.time,
          notes: form.notes,
          amount: form.amount,
          payment_option: form.payment_option,
          status: form.status,
        };
        
        const response = await fetch(buildApiUrl(endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            setItems((prev) => prev.map((it) => it.id === form.id ? form : it));
            setForm({ 
              id: '', 
              customer: '', 
              email: '', 
              phone: '', 
              service: '', 
              date: '', 
              time: '',
              notes: '',
              amount: 0,
              payment_option: '',
              status: 'pending' 
            });
            alert(isOrder ? 'Order updated successfully!' : 'Booking updated successfully!');
          } else {
            alert(isOrder ? 'Failed to update order' : 'Failed to update booking');
          }
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          if (isOrder) {
            alert('Orders cannot be updated. This is a payment record that cannot be modified.');
          } else {
            alert(`Failed to update booking: ${errorText}`);
          }
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
          const errorText = await res.text().catch(() => 'Unknown error');
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          alert(errorData.error || 'Failed to create booking');
        }
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      alert(`An error occurred while processing the booking: ${err.message || 'Unknown error'}`);
    }
    setForm({ 
      id: '', 
      customer: '', 
      email: '', 
      phone: '', 
      service: '', 
      date: '', 
      time: '',
      notes: '',
      amount: 0,
      payment_option: '',
      status: 'pending' 
    });
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
      <AdminLayout title="Bookings & Orders">
        <div style={{ padding: 16, color: '#fff', maxWidth: '100%', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Bookings & Orders</h1>
          <div>
            <Link to="/admin" style={{ color: '#06d6a0', marginRight: 8, fontSize: '0.9rem' }}>Dashboard</Link>
            <Link to="/admin/availability" style={{ color: '#06d6a0', fontSize: '0.9rem' }}>Availability</Link>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={(e)=>{e.preventDefault(); load(filters);}} style={{ marginBottom: 16, background: '#101010', border: '1px solid #222', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
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
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Apply Filters</button>
            <button type="button" onClick={()=>{ setFilters({ status:'', email:'', date_from:'', date_to:''}); load({ status:'', email:'', date_from:'', date_to:''}); }} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Reset</button>
          </div>
        </form>

        <form onSubmit={submit} style={{ marginBottom: 16, background: '#121212', border: '1px solid #222', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Customer</div>
              <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Email</div>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Phone</div>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Service</div>
              <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Date</div>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Time</div>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Amount</div>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} style={{ padding: '6px', fontSize: '0.8rem' }} />
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Payment Option</div>
              <select value={form.payment_option} onChange={(e) => setForm({ ...form, payment_option: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }}>
                <option value="">Select Payment Option</option>
                <option value="full">Full Payment</option>
                <option value="deposit">Deposit Only</option>
                <option value="pending">Pending</option>
              </select>
            </label>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Status</div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ padding: '6px', fontSize: '0.8rem' }}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: 4 }}>Notes</div>
              <textarea 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                style={{ width: '100%', minHeight: '60px', resize: 'vertical', padding: '6px', fontSize: '0.8rem' }}
                placeholder="Additional notes or requirements..."
              />
            </label>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{form.id ? 'Update Booking' : 'Create Booking'}</button>
            {form.id && (
              <button type="button" onClick={() => setForm({ 
                id: '', 
                customer: '', 
                email: '', 
                phone: '', 
                service: '', 
                date: '', 
                time: '',
                notes: '',
                amount: 0,
                payment_option: '',
                status: 'pending' 
              })} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
            )}
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              background: '#1a1a1a', 
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>Loading...</h3>
              <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>
                Fetching bookings and orders...
              </p>
            </div>
          ) : items.length === 0 ? (
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
    </Guard>
  );
}
