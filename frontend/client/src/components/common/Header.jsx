import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext.jsx"; 
import { UserContext } from "../../context/UserContext.jsx";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { cartCount } = useCart(); 
  const defaultProfilePic = "/assets/profile.png";

  const handleLogout = async () => {
    try {
      await fetch("http://localhost/crtv-shots-website/backend/api/logout.php", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className=" w-full z-50 bg-white-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center text-white font-bold text-lg">
              <img className="h-10 w-auto mr-2" src="../assets/logo.png" alt="Logo" />
              CRTV SHOTS
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-yellow-400">Home</Link>
            <Link to="/shop" className="text-gray-300 hover:text-yellow-400">Shop</Link>
            <Link to="/bookings" className="text-gray-300 hover:text-yellow-400">Bookings</Link>
            <Link to="/gallery" className="text-gray-300 hover:text-yellow-400">Gallery</Link>

            {user ? (
              <div className="flex items-center space-x-2 text-Black-300">
                <img src={defaultProfilePic} alt="Profile" className="h-8 w-8 rounded-full" />
                <span>{user.user_firstname} {user.user_surname}</span>
                <button onClick={handleLogout} className="text-black hover:text-gray-700 ml-2 font-semibold">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <img src={defaultProfilePic} alt="Profile" className="h-8 w-8 rounded-full" />
                <Link to="/login" className="text-gray-300 hover:text-yellow-400">
                  Login / Signup
                </Link>
              </div>
            )}
          </div>

          {/* Cart + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate("/cart")} className="relative p-2 bg-yellow-400 hover:bg-yellow-500 rounded-full transition duration-200">
              <ShoppingCartIcon className="h-6 w-6 text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-s font-bold rounded-full px-1.5">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${mobileOpen ? "block" : "hidden"} md:hidden bg-gray-900 border-t border-gray-700`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          <Link to="/" className="block text-gray-300 hover:text-yellow-400 py-2">Home</Link>
          <Link to="/shop" className="block text-gray-300 hover:text-yellow-400 py-2">Shop</Link>
          <Link to="/bookings" className="block text-gray-300 hover:text-yellow-400 py-2">Bookings</Link>
          <Link to="/gallery" className="block text-gray-300 hover:text-yellow-400 py-2">Gallery</Link>

          {/* Mobile User Info */}
          {user ? (
            <div className="flex items-center space-x-2 py-2 text-gray-300">
              <img src={defaultProfilePic} alt="Profile" className="h-8 w-8 rounded-full" />
              <span>{user.user_firstname} {user.user_surname}</span>
              <button onClick={handleLogout} className="text-yellow-400 hover:text-yellow-500 ml-2">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 py-2">
              <img src={defaultProfilePic} alt="Profile" className="h-8 w-8 rounded-full" />
              <Link to="/login" className="text-gray-300 hover:text-yellow-400">
                Login / Signup
              </Link>
            </div>
          )}

          {/* Mobile Cart */}
          <button
            onClick={() => navigate("/cart")}
            className="mt-3 flex items-center bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg w-full justify-center"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            View Cart
            {cartCount > 0 && (
              <span className="ml-2 bg-white text-black text-s font-bold rounded-full px-1.5">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
