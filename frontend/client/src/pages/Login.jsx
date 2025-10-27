import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const Login = () => {
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
      const res = await fetch(
        "http://localhost/crtv-shots-website/backend/api/config/login.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("Login Response:", data);

      if (data.success) {
        sessionStorage.setItem("user_email", email);
        navigate("/Verify2FA");
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

  const handleResendVerification = async () => {
    try {
      const formData = new FormData();
      formData.append("user_email", email);
      const res = await fetch(
        "http://localhost/crtv-shots-website/backend/api/config/resend_verification.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Failed to send verification email. Try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <Header />

      {/* Main Login Form */}
      <main className="flex-grow flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Login
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">
              {error}
              {error.toLowerCase().includes("verify your email") && (
                <button
                  type="button"
                  className="ml-2 underline text-blue-600"
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-[#06d6a0] text-black p-3 rounded font-semibold hover:bg-[#05b88c] transition"
            >
              Login
            </button>
          </form>

          {/* Signup / Forgot Password */}
          <div className="mt-6 text-center text-sm">
            <p>
              Don't have an account?{" "}
              <a
                href="http://localhost/crtv-shots-website/backend/api/config/signup.php"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </a>
            </p>
            <p className="mt-2">
              <a
                href="http://localhost/crtv-shots-website/backend/api/config/forgot_password.php"
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot Password?
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login;
