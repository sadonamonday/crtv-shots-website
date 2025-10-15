import React, { useState } from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";

// A simplified React version of BookingsPage.html
// Focus: keep styling (Tailwind) and provide a basic multi-step booking flow
export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  function next() {
    setStep((s) => Math.min(4, s + 1));
  }
  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }
  function submitForm(e) {
    e.preventDefault();
    // Here you could POST to backend/api/bookings
    setSubmitted(true);
  }

  const stepClass = (n) =>
    `step-indicator ${step === n ? "active" : step > n ? "bg-blue-500 text-white" : ""}`;

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen text-white">
      <Header />

      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2 text-center">Book Videography Services</h1>
          <p className="text-gray-400 text-center mb-10">
            Capture your special moments with professional videography
          </p>

          {/* Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center">
              <div className={`${stepClass(1)} w-8 h-8 rounded-full flex items-center justify-center mr-2 border border-gray-600`}>1</div>
              <div className={`${step >= 1 ? "text-white" : "text-gray-500"} mx-2`}>Service Selection</div>
              <div className="w-12 h-1 bg-gray-600 mx-2" />
            </div>
            <div className="flex items-center">
              <div className={`${stepClass(2)} w-8 h-8 rounded-full flex items-center justify-center mr-2 border border-gray-600`}>2</div>
              <div className={`${step >= 2 ? "text-white" : "text-gray-500"} mx-2`}>Date & Time</div>
              <div className="w-12 h-1 bg-gray-600 mx-2" />
            </div>
            <div className="flex items-center">
              <div className={`${stepClass(3)} w-8 h-8 rounded-full flex items-center justify-center mr-2 border border-gray-600`}>3</div>
              <div className={`${step >= 3 ? "text-white" : "text-gray-500"} mx-2`}>Your Details</div>
              <div className="w-12 h-1 bg-gray-600 mx-2" />
            </div>
            <div className="flex items-center">
              <div className={`${stepClass(4)} w-8 h-8 rounded-full flex items-center justify-center mr-2 border border-gray-600`}>4</div>
              <div className={`${step >= 4 ? "text-white" : "text-gray-500"} mx-2`}>Review</div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800 rounded-lg p-6">
            {submitted ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-2">Thanks! Your request was sent.</h2>
                <p className="text-gray-400">We will contact you shortly to confirm your booking.</p>
              </div>
            ) : (
              <div>
                {step === 1 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Choose a service</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: "wedding", name: "Wedding Package" },
                        { id: "event", name: "Event Coverage" },
                        { id: "promo", name: "Promo Video" },
                        { id: "music", name: "Music Video" },
                        { id: "product", name: "Product Shoot" },
                        { id: "other", name: "Other" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setService(opt.id)}
                          className={`border rounded-lg p-4 text-left hover:border-blue-400 transition ${
                            service === opt.id ? "border-blue-500 bg-gray-700" : "border-gray-700"
                          }`}
                        >
                          <div className="font-medium">{opt.name}</div>
                          <div className="text-gray-400 text-sm">Click to select</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-6">
                      <span />
                      <button
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                        onClick={next}
                        disabled={!service}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Select date & time</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Time</label>
                        <input
                          type="time"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={prev}>
                        Back
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                        onClick={next}
                        disabled={!date || !time}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <form onSubmit={next}>
                    <h3 className="text-xl font-semibold mb-4">Your details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Name</label>
                        <input
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                          value={details.name}
                          onChange={(e) => setDetails({ ...details, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                          value={details.email}
                          onChange={(e) => setDetails({ ...details, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Phone</label>
                        <input
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                          value={details.phone}
                          onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-300 mb-1">Notes</label>
                        <textarea
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-24"
                          value={details.notes}
                          onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={(e)=>{e.preventDefault();prev();}}>
                        Back
                      </button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
                        Next
                      </button>
                    </div>
                  </form>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Review & submit</h3>
                    <div className="space-y-2 text-gray-300">
                      <div>
                        <span className="text-gray-400">Service:</span> {service || "-"}
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span> {date || "-"}
                      </div>
                      <div>
                        <span className="text-gray-400">Time:</span> {time || "-"}
                      </div>
                      <div>
                        <span className="text-gray-400">Name:</span> {details.name || "-"}
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span> {details.email || "-"}
                      </div>
                      {details.phone && (
                        <div>
                          <span className="text-gray-400">Phone:</span> {details.phone}
                        </div>
                      )}
                      {details.notes && (
                        <div>
                          <span className="text-gray-400">Notes:</span> {details.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-6">
                      <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={prev}>
                        Back
                      </button>
                      <button className="px-4 py-2 rounded bg-green-600 hover:bg-green-500" onClick={submitForm}>
                        Submit Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
