import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import buildApiUrl from "../../utils/api.js";

const AdminSignup = () => {
  const [form, setForm] = useState({
    user_firstname: "",
    user_surname: "",
    user_username: "",
    user_email: "",
    user_password: "",
    user_address: "",
    user_contact: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    try {
      const res = await fetch(buildApiUrl(
        "/config/admin_signup.php"),
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || "Admin signup successful. Check your email.");
        // Redirect to admin login after a short delay
        setTimeout(() => navigate("/admin/login"), 1200);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-4xl mb-6">Admin Sign Up</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md gap-3">
        <input name="user_firstname" placeholder="First Name" value={form.user_firstname} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="user_surname" placeholder="Surname" value={form.user_surname} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="user_username" placeholder="Username" value={form.user_username} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input type="email" name="user_email" placeholder="Email" value={form.user_email} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input type="password" name="user_password" placeholder="Password" value={form.user_password} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="user_address" placeholder="Address" value={form.user_address} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <input name="user_contact" placeholder="Contact" value={form.user_contact} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" required />
        <button type="submit" className="bg-[#06d6a0] text-black p-2 rounded font-bold">Create Admin</button>
      </form>

      <div className="mt-4 text-center">
        <p>
          Already have an admin account?{" "}
          <Link to="/admin/login" className="text-[#06d6a0] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
