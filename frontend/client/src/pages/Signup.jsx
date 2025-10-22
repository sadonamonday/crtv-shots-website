import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import buildApiUrl from "../utils/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    user_firstname: "",
    user_surname: "",
    user_username: "",
    user_email: "",
    user_password: "",
    conf_user_password: "",
    user_address: "",
    user_contact: ""
  });
  const [errors, setErrors] = useState([]);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const checkUsername = async (username) => {
    if (username.length < 4) return;
    
    try {
      const response = await fetch(
        buildApiUrl(`/config/check_username.php?username=${encodeURIComponent(username)}`)
      );
      const data = await response.json();
      
      if (!data.available && data.suggestions) {
        setUsernameSuggestions(data.suggestions);
      } else {
        setUsernameSuggestions([]);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const checkEmail = async (email) => {
    if (!email.includes('@gmail.com')) return;
    
    try {
      const response = await fetch(
        buildApiUrl(`/config/check_email.php?email=${encodeURIComponent(email)}`)
      );
      const data = await response.json();
      // Handle email availability check
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append("signup", "1");

    try {
      const apiUrl = buildApiUrl('/config/signup_api.php');
      console.log('Attempting to fetch from URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        // Redirect to login page after successful signup
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors([data.message || "Signup failed. Please try again."]);
        }
        if (data.username_suggestions) {
          setUsernameSuggestions(data.username_suggestions);
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors(["Network error. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl mb-6 text-green-500">Signup Successful!</h1>
          <p className="mb-4">Please check your email to verify your account.</p>
          <p className="text-sm text-gray-400">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
      <h1 className="text-4xl mb-6 font-bold">Create an Account</h1>
      
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg max-w-md w-full">
          {errors.map((error, index) => (
            <p key={index} className="text-red-300 mb-1">{error}</p>
          ))}
          {usernameSuggestions.length > 0 && (
            <p className="text-yellow-300 mt-2">
              <strong>Try one:</strong> {usernameSuggestions.join(', ')}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="user_firstname"
              placeholder="First Name"
              value={formData.user_firstname}
              onChange={handleInputChange}
              className="p-3 rounded bg-gray-800 text-white w-full"
              required
            />
          </div>
          <div>
            <input
              type="text"
              name="user_surname"
              placeholder="Surname"
              value={formData.user_surname}
              onChange={handleInputChange}
              className="p-3 rounded bg-gray-800 text-white w-full"
              required
            />
          </div>
        </div>

        <input
          type="text"
          name="user_username"
          placeholder="Username"
          value={formData.user_username}
          onChange={(e) => {
            handleInputChange(e);
            checkUsername(e.target.value);
          }}
          className="p-3 rounded bg-gray-800 text-white"
          required
        />

        <input
          type="email"
          name="user_email"
          placeholder="Email (Gmail only)"
          value={formData.user_email}
          onChange={(e) => {
            handleInputChange(e);
            checkEmail(e.target.value);
          }}
          className="p-3 rounded bg-gray-800 text-white"
          required
        />

        <input
          type="password"
          name="user_password"
          placeholder="Password"
          value={formData.user_password}
          onChange={handleInputChange}
          className="p-3 rounded bg-gray-800 text-white"
          required
        />

        <input
          type="password"
          name="conf_user_password"
          placeholder="Confirm Password"
          value={formData.conf_user_password}
          onChange={handleInputChange}
          className="p-3 rounded bg-gray-800 text-white"
          required
        />

        <input
          type="text"
          name="user_address"
          placeholder="Address"
          value={formData.user_address}
          onChange={handleInputChange}
          className="p-3 rounded bg-gray-800 text-white"
          required
        />

        <input
          type="text"
          name="user_contact"
          placeholder="Contact Number (SA format)"
          value={formData.user_contact}
          onChange={handleInputChange}
          className="p-3 rounded bg-gray-800 text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#06d6a0] text-black p-3 rounded font-bold hover:bg-[#05b389] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p>
          Already have an account?{" "}
          <button
            onClick={() => navigate('/login')}
            className="text-[#06d6a0] hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
