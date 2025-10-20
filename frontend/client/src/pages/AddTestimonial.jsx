import React, { useState } from "react";
import buildApiUrl from "../utils/api";

const AddTestimonial = () => {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("message", message);
    formData.append("rating", rating);

    try {
      const res = await fetch(
        buildApiUrl('/reviews/create.php'),
        {
          method: "POST",
          body: formData,
          credentials: "include", // preserve session
        }
      );

      const data = await res.json().catch(() => null);
      if (res.ok) {
        setSuccess("Testimonial submitted successfully!");
        setError("");
        setMessage("");
        setRating("");
      } else {
        setError(data?.error || "Failed to submit testimonial.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-3xl mb-4">Add Testimonial</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <textarea
          placeholder="Your testimonial"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 text-black rounded"
          maxLength="200"
          required
        />
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="p-2 text-black rounded"
          required
        >
          <option value="">Select rating</option>
          <option value="5">★★★★★ (5 stars)</option>
          <option value="4">★★★★☆ (4 stars)</option>
          <option value="3">★★★☆☆ (3 stars)</option>
          <option value="2">★★☆☆☆ (2 stars)</option>
          <option value="1">★☆☆☆☆ (1 star)</option>
        </select>

        <button
          type="submit"
          className="bg-[#06d6a0] text-black font-bold p-2 rounded hover:bg-[#05b68a]"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddTestimonial;
