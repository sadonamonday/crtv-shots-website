import React from "react"; 
import { useCart } from "../context/CartContext.jsx";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    total,
  } = useCart();

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow pt-24 px-6 text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-gray-700 mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded transition"
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="bg-white rounded-lg p-4 flex justify-between items-center shadow-md"
                >
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-yellow-400">
                      R{item.price} × {item.quantity} = R{item.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-2 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-2 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-400 hover:bg-red-500 text-black px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={clearCart}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-4 py-2 rounded"
              >
                Clear Cart
              </button>
              <div className="text-xl font-bold text-yellow-400">
                Subtotal: R{total}
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-gray-200 text-gray-900 p-3 rounded hover:bg-gray-300 transition"
                  onClick={() => navigate("/shop")}
                >
                  Continue to Shop
                </button>
                <button
                  onClick={() => navigate("/checkout")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
