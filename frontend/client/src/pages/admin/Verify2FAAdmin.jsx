import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import buildApiUrl from "../../utils/api.js";

const Verify2FAAdmin = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("admin_email");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("user_email", email);
    formData.append("two_factor_code", code);

    try {
      const res = await fetch(buildApiUrl("/config/admin_verify_2fa.php")
        ,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        try {
          localStorage.setItem("admin_auth", "true");
        } catch (_) {}
        navigate("/admin");
      } else {
        setError(data.message || "Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error, please try again later.");
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please log in again.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("user_email", email);

      const res = await fetch(buildApiUrl("/config/admin_resend_2fa.php")
        ,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();
      if (data.success) {
        setMessage("A new verification code has been sent to your email.");
      } else {
        setError(data.message || "Failed to resend code. Try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
      <h1 className="text-4xl mb-4 font-bold">Admin 2FA Verification</h1>
      <p className="mb-6 text-center">
        Enter the 6-digit verification code sent to your email.
      </p>

      {error && <p className="mb-4 text-red-500">{error}</p>}
      {message && <p className="mb-4 text-green-500">{message}</p>}

      <form
        onSubmit={handleVerify}
        className="flex flex-col w-full max-w-sm gap-4"
      >
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 6) setCode(value);
          }}
          maxLength={6}
          inputMode="numeric"
          pattern="\d{6}"
          className="p-2 rounded bg-gray-800 text-white text-center tracking-widest text-lg"
          required
        />

        <button
          type="submit"
          className="bg-[#06d6a0] text-black p-2 rounded font-bold hover:bg-[#05b389]"
        >
          Verify
        </button>
      </form>

      <p className="mt-4 text-center">
        Didn’t get the code?{" "}
        <button
          onClick={handleResendCode}
          disabled={resending}
          className={`text-black hover:underline ${
            resending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {resending ? "Resending..." : "Resend Code"}
        </button>
      </p>

      <p className="mt-4 text-center">
        <button onClick={() => navigate("/admin/login")} className="text-black hover:underline">
          Back to Admin Login
        </button>
      </p>
    </div>
  );
};

export default Verify2FAAdmin;
