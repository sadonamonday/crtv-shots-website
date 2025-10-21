import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import buildApiUrl from "../utils/api";

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
        buildApiUrl('/config/login.php'),
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log("Login Response:", data);

      if (data.success) {
        try {
          // Mark logged-in state; store minimal user info if provided
          localStorage.setItem("isLoggedIn", "1");
          if (data.user) {
            localStorage.setItem("userName", data.user.name || "");
            if (data.user.avatarUrl) {
              localStorage.setItem("avatarUrl", data.user.avatarUrl);
            }
          }
        } catch (_) {}

        if (data.two_fa) {
          // Email verified, proceed to 2FA step
          sessionStorage.setItem("user_email", email);
          navigate("/Verify2FA");
        } else {
          // 2FA not required (disabled or already verified)
          navigate("/");
        }
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
        buildApiUrl('/config/resend_verification.php'),
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
      {error && <p className="mb-4 text-red-500">{error}</p>}
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

      {/* Links for Signup and Forgot Password */}
      <div className="mt-4 text-center">
        <p>
          Don't have an account?{" "}
          <a
            href={buildApiUrl('/config/signup.php')}
            className="text-[#06d6a0] hover:underline"
          >
            Sign up
          </a>
        </p>
        <p className="mt-2">
          <a
            href={buildApiUrl('/config/forgot_password.php')}
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
