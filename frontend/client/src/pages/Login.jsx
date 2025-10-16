import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_email", email);
    formData.append("user_password", password);

    try {
      const res = await fetch(
        "http://localhost/finalyearproject/my-app/backend/config/login.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        navigate("/"); // Navigate to Home.jsx
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Server error, please try again later.");
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
            href="http://localhost/finalyearproject/my-app/backend/config/signup.php"
            className="text-[#06d6a0] hover:underline"
          >
            Sign up
          </a>
        </p>
        <p className="mt-2">
          <a
            href="http://localhost/finalyearproject/my-app/backend/config/forgot_password.php"
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
