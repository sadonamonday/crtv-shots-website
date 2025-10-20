import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        "http://localhost/crtv-shots-website/backend/config/login.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("Login Response:", data);

      if (data.success) {
        // Email verified, proceed to 2FA
        sessionStorage.setItem("user_email", email);
        navigate("/Verify2FA");
      } else if (data.email_verified === false) {
        // Show error and allow resend
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
        "http://localhost/crtv-shots-website/backend/config/resend_verification.php",
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-4xl mb-6">Login</h1>

      {/* Error Message */}
      {error && (
        <p className="mb-4 text-red-500">
          {error}
          {error.toLowerCase().includes("verify your email") && (
            <button
              type="button"
              className="ml-2 underline text-dark"
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </button>
          )}
        </p>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="flex flex-col w-full max-w-sm gap-4">
        <input
          type="email"
          placeholder="Email"
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

      {/* Signup / Forgot Password */}
      <div className="mt-4 text-center">
        <p>
          Don't have an account?{" "}
          <a
            href="http://localhost/crtv-shots-website/backend/config/signup.php"
            className="text-[#06d6a0] hover:underline"
          >
            Sign up
          </a>
        </p>
        <p className="mt-2">
          <a
            href="http://localhost/crtv-shots-website/backend/config/forgot_password.php"
            className="text-[#06d6a0] hover:underline"
          >
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
