import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const Checkout = () => {
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const shippingRate = 110;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          "http://localhost/crtv-shots-website/backend/api/get_user.php",
          { credentials: "include" }
        );
        const data = await res.json();
        if (!data.error && data.user_email) {
          setUser({
            name: `${data.user_firstname} ${data.user_surname}`,
            email: data.user_email,
            address: data.user_address || "",
          });
        } else {
          const savedGuest = JSON.parse(localStorage.getItem("guestInfo"));
          if (savedGuest) setUser(savedGuest);
        }
      } catch {
        const savedGuest = JSON.parse(localStorage.getItem("guestInfo"));
        if (savedGuest) setUser(savedGuest);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem("guestInfo", JSON.stringify(user));
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user.name || !user.email || !user.address) {
      alert("Please enter your name, email, and shipping address.");
      return;
    }

    const finalTotal = total + shippingRate;
    const orderData = {
      user_name: user.name,
      user_email: user.email,
      user_address: user.address,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
      })),
      subtotal: parseFloat(total),
      shipping: parseFloat(shippingRate),
      total: parseFloat(finalTotal),
    };

    try {
      setSubmitting(true);
      const response = await fetch(
        "http://localhost/crtv-shots-website/backend/api/orders/place_order.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert("Server returned invalid response. Check console.");
        return;
      }

      if (data.success) {
        alert("Order placed successfully!");
        clearCart();
        localStorage.removeItem("guestInfo");
        navigate("/");
      } else {
        alert("Error placing order: " + (data.message || "Unknown error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow pt-5 px-6 text-gray-900 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-700 text-center">Your cart is empty.</p>
        ) : (
          <>
            {/* Order Details */}
            <div className="bg-white p-4 rounded mb-6 shadow">
              <h2 className="text-xl font-semibold mb-2">Order Details</h2>
              <ul className="space-y-2">
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between bg-gray-100 p-3 rounded"
                  >
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>R{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-right text-xl font-bold text-yellow-400">
                Subtotal: R{total}
              </div>
            </div>

            {/* Shipping */}
            <div className="mb-6 flex justify-between items-center bg-gray-100 p-3 rounded">
              <span>Shipping:</span>
              <span>Flat Rate: R{shippingRate}</span>
            </div>

            {/* Shipping Info */}
            <div className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-3">Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Shipping Address</label>
                  <textarea
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Enter your shipping address"
                    rows="3"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="mb-6 flex justify-between items-center text-xl font-bold text-yellow-400 bg-gray-100 p-3 rounded">
              <span>Total:</span>
              <span>R{total + shippingRate}</span>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className={`${
                submitting ? "bg-gray-400" : "bg-yellow-700 hover:bg-yellow-800"
              } text-black font-semibold px-6 py-3 rounded w-full transition`}
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
