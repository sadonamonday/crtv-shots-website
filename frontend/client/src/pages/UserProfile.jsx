import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import buildApiUrl from "../utils/api";
import { listOrders } from "../api/orders";
import { formatZAR } from "../utils/currency";

// Component to edit one field at a time
const EditableField = ({ label, value, email, fieldName }) => {
  const [editMode, setEditMode] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(
        buildApiUrl('/config/update_user_field.php'),
        {
          method: "POST",
          body: JSON.stringify({ user_email: email, field: fieldName, value: fieldValue }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage("Updated successfully!");
        setEditMode(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const handleCancel = () => {
    setFieldValue(value);
    setEditMode(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-bold">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          readOnly={!editMode}
          className={`p-2 border rounded w-full ${
            editMode ? "bg-white" : "bg-gray-200"
          }`}
        />
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white p-1 rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white p-1 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-500 text-white p-1 rounded"
          >
            Edit
          </button>
        )}
      </div>
      {message && <p className="text-green-500 mt-1">{message}</p>}
      {error && <p className="text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Change Password Component
const ChangePassword = ({ email }) => {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    setMessage("");
    setError("");

    if (newPwd.length < 8 || !/[A-Z]/.test(newPwd) || !/[0-9]/.test(newPwd) || !/[\W]/.test(newPwd)) {
      setError("Password must be at least 8 characters, include uppercase, number, and special character.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(
        buildApiUrl('/config/change_password.php'),
        {
          method: "POST",
          body: JSON.stringify({ user_email: email, current_password: currentPwd, new_password: newPwd }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) setMessage(data.message);
      else setError(data.message);
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="mt-8 p-4 border rounded bg-gray-50 text-black">
      <h2 className="text-lg font-bold mb-2">Change Password</h2>
      <input
        type="password"
        placeholder="Current Password"
        value={currentPwd}
        onChange={(e) => setCurrentPwd(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPwd}
        onChange={(e) => setNewPwd(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPwd}
        onChange={(e) => setConfirmPwd(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <button
        onClick={handleChangePassword}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Change Password
      </button>
      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user_data"));
    if (!storedUser) navigate("/login");
    else setUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    async function loadOrders(uid) {
      setOrdersLoading(true); setOrdersError("");
      try {
        const res = await listOrders(uid ? { userId: uid } : {});
        setOrders(res.items || []);
      } catch (e) {
        setOrdersError(String(e.message || e));
      } finally { setOrdersLoading(false); }
    }
    if (user && (user.id || user.user_id)) {
      loadOrders(user.id || user.user_id);
    }
  }, [user]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">My Account</h2>
        <nav className="flex flex-col gap-2 text-gray-700">
          <button className="text-left hover:underline">Orders</button>
          <button className="text-left hover:underline">Returns</button>
          <button className="text-left hover:underline">Bookings</button>
          <button className="text-left hover:underline">Product Review</button>
          <button className="text-left hover:underline">Credit & Refunds</button>
          <button className="text-left hover:underline">Return Policy</button>
          <button
            onClick={handleLogout}
            className="mt-auto text-left text-red-500 hover:underline"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Account Details</h1>

        {/* Editable Fields */}
        <EditableField label="First Name" value={user.firstname} email={user.email} fieldName="user_firstname" />
        <EditableField label="Surname" value={user.surname} email={user.email} fieldName="user_surname" />
        <EditableField label="Username" value={user.username} email={user.email} fieldName="user_username" />
        <EditableField label="Email" value={user.email} email={user.email} fieldName="user_email" />
        <EditableField label="Address" value={user.address} email={user.email} fieldName="user_address" />

        {/* Orders Section */}
        <div className="mt-8 p-4 border rounded bg-white text-black">
          <h2 className="text-lg font-bold mb-2">My Orders</h2>
          {ordersError && <div className="text-red-500 mb-2">{ordersError}</div>}
          {ordersLoading ? (
            <div>Loading orders...</div>
          ) : (
            <div className="overflow-x-auto">
              {(!orders || orders.length === 0) ? (
                <div className="text-gray-500">No orders found.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b">
                        <td className="p-2">{o.id}</td>
                        <td className="p-2">${o.total}</td>
                        <td className="p-2">{o.status}</td>
                        <td className="p-2">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <ChangePassword email={user.email} />
      </div>
    </div>
  );
};

export default UserProfile;
