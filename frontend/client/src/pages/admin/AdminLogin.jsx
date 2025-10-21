import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import buildApiUrl from "../../utils/api.js";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("user_email", email);
    formData.append("user_password", password);

    try {
      const res = await fetch(buildApiUrl( "/config/admin_login.php"),
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        if (data.two_fa) {
          // Proceed to admin 2FA verification
          sessionStorage.setItem("admin_email", email);
          navigate("/admin/verify-2fa");
        } else {
          // 2FA not required (disabled or already verified)
          try { localStorage.setItem("admin_auth", "true"); } catch (_) {}
          navigate("/admin");
        }
      } else if (data.email_verified === false) {
        setError(data.message || "Please verify your email first.");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error, please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-4xl mb-6">Admin Login</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col w-full max-w-sm gap-4">
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white"
          required
        />
        <button
          type="submit"
          className="bg-[#06d6a0] text-black p-2 rounded font-bold"
        >
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <p>
          Don't have an admin account?{" "}
          <Link to="/admin/signup" className="text-[#06d6a0] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
