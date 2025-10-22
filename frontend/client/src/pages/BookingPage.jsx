import React, { useEffect, useState } from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";
import buildApiUrl from "../utils/api";
import axios from "axios";

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState({ name: "", email: "", phone: "", notes: "" });
  const [customService, setCustomService] = useState({ title: "", description: "", budget: "" });
  const [submitted, setSubmitted] = useState(false);
  const [paymentOption, setPaymentOption] = useState(""); // "full" or "deposit"
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(buildApiUrl('/bookings/getAvailability.php'));
        if (res.ok) {
          const data = await res.json();
          const dates = Array.isArray(data?.dates) ? data.dates : [];
          if (!cancelled) setAvailableDates(dates);
        }
      } catch {}
      finally {
        if (!cancelled) setLoadingAvail(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Service pricing information
  const servicePricing = {
    matricdance: { name: "Matric Dance: Video & Photography", price: 1500, type: "hourly" },
    mdphotography: { name: "Matric Dance: Photography ONLY", price: 1000, type: "fixed" },
    promo: { name: "Music Video: DJI Osmo (Visualizer)", price: 5000, type: "fixed" },
    music: { name: "Music Video: Reels", price: 3500, type: "fixed" },
    editing: { name: "Music Video Editing", price: 3000, type: "fixed" },
    grading: { name: "Color Grading", price: 2000, type: "fixed" },
    other: { name: "Custom Service", price: 0, type: "custom" }
  };

  const services = [
    { id: "matricdance", name: "Matric Dance: Video & Photography", price: "R1500/h" },
    { id: "mdphotography", name: "Matric Dance: Photography ONLY", price: "R1000" },
    { id: "promo", name: "Music Video: DJI Osmo (Visualizer)", price: "R5000" },
    { id: "music", name: "Music Video: Reels", price: "R3500" },
    { id: "editing", name: "Music Video Editing", price: "R3000" },
    { id: "grading", name: "Color Grading", price: "R2000" },
    { id: "other", name: "Other" },
  ];

  const next = () => {
    setStep((s) => Math.min(5, s + 1));
  };

  const prev = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        service,
        date,
        time,
        name: details.name,
        email: details.email,
        phone: details.phone,
        notes: details.notes,
        amount: paymentAmounts.full,
        paymentOption: paymentOption || 'full',
      };
      const res = await fetch(buildApiUrl('/bookings/createBookings.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 409) {
          alert('The selected date is no longer available. Please pick another available date.');
          setStep(2);
          return;
        }
        throw new Error('Failed to create booking');
      }
      await res.json();
      setSubmitted(true);
    } catch (err) {
      alert('Failed to create booking. Please try again.');
    }
  };

  // Reset to service selection and clear custom service data
  const resetToServiceSelection = () => {
    setService("");
    setCustomService({ title: "", description: "", budget: "" });
    setStep(1);
  };

  // Handle service selection
  const handleServiceSelect = (serviceId) => {
    setService(serviceId);
    if (serviceId === "other") {
      // Stay on step 1 to show custom service form
    } else {
      // Auto-advance to next step for predefined services
      setTimeout(() => next(), 300);
    }
  };

  // Calculate payment amounts
  const calculatePaymentAmounts = () => {
    if (service === "other") {
      // For custom services, I will try to extract price from budget field or use 0
      const budgetMatch = customService.budget?.match(/R?\s*(\d+)/);
      const customPrice = budgetMatch ? parseInt(budgetMatch[1]) : 0;
      return {
        full: customPrice || 0,
        deposit: Math.round((customPrice || 0) * 0.5)
      };
    } else {
      const serviceInfo = servicePricing[service];
      if (!serviceInfo) return { full: 0, deposit: 0 };
      
      const fullAmount = serviceInfo.type === "hourly" ? serviceInfo.price * 2 : serviceInfo.price;
      return {
        full: fullAmount,
        deposit: Math.round(fullAmount * 0.5)
      };
    }
  };

  const paymentAmounts = calculatePaymentAmounts();

  const stepClass = (n) =>
    `step-indicator w-8 h-8 rounded-full flex items-center justify-center mr-2 border ${
      step === n 
        ? "bg-blue-500 text-white border-blue-500" 
        : step > n 
        ? "bg-blue-500 text-white border-blue-500" 
        : "border-gray-600 text-gray-400"
    }`;

  // Handle payment 
  const handlePayment = async (paymentType) => {
    const amount = paymentType === "full" ? paymentAmounts.full : paymentAmounts.deposit;
    try {
      const payload = {
        service,
        date,
        time,
        name: details.name,
        email: details.email,
        phone: details.phone,
        notes: details.notes,
        amount,
        paymentOption: paymentType,
      };
      const res = await fetch(buildApiUrl('/bookings/createBookings.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create booking');
      await res.json();
      setSubmitted(true);
    } catch (err) {
      alert('Failed to create booking. Please try again.');
    }
  };

const handlePay = async () => {
  try {
    const payAmount = parseFloat(
      paymentOption === "full" ? paymentAmounts.full : paymentAmounts.deposit
    );

    const res = await await axios.post(
  "http://localhost:8000/api/payments/payfast_initiate.php",
  { amount: payAmount, item_name: service, item_description: "Service payment", email: "customer@example.com" },
  { headers: { "Content-Type": "application/json" } }
);


    console.log(res.data); // should show redirectUrl
    window.location.href = res.data.redirectUrl;
  } catch (err) {
    console.error(err);
    alert("Payment initialization failed");
  }
};


  
  const getServiceDisplayName = () => {
    if (service === "other") {
      return customService.title || "Custom Service";
    }
    return servicePricing[service]?.name || service;
  };

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
          <div className="flex justify-center mb-12 overflow-x-auto">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className="flex items-center">
                    <div className={stepClass(stepNumber)}>{stepNumber}</div>
                    <div className={`text-sm mx-2 ${step >= stepNumber ? "text-white" : "text-gray-500"}`}>
                      {stepNumber === 1 && "Service"}
                      {stepNumber === 2 && "Date & Time"}
                      {stepNumber === 3 && "Your Details"}
                      {stepNumber === 4 && "Review"}
                      {stepNumber === 5 && "Payment"}
                    </div>
                  </div>
                  {stepNumber < 5 && <div className="w-8 h-1 bg-gray-600" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800 rounded-lg p-6">
            {submitted ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-2">Thanks! Your booking was confirmed.</h2>
                <p className="text-gray-400">We will contact you shortly with more details about your session.</p>
              </div>
            ) : (
              <div>
                {/* Step 1: Service Selection */}
                {step === 1 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      {service === "other" ? "Describe Your Custom Service Request" : "Choose a service"}
                    </h3>
                    
                    {service === "other" ? (
                      // Custom service form
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Service Title *</label>
                          <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                            placeholder="e.g., Corporate Event Videography, Wedding Highlights, etc."
                            value={customService.title}
                            onChange={(e) => setCustomService({ ...customService, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Detailed Description *</label>
                          <textarea
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-32 focus:border-blue-500 focus:outline-none transition"
                            placeholder="Please describe exactly what you need... Include details like event type, duration, specific requirements, style preferences, etc."
                            value={customService.description}
                            onChange={(e) => setCustomService({ ...customService, description: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Budget Estimate (Optional)</label>
                          <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                            placeholder="e.g., R2000, R5000-7000, To be discussed"
                            value={customService.budget}
                            onChange={(e) => setCustomService({ ...customService, budget: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <button 
                            type="button"
                            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                            onClick={resetToServiceSelection}
                          >
                            ← Back to Services
                          </button>
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            onClick={next}
                            disabled={!customService.title.trim() || !customService.description.trim()}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Original service selection grid
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {services.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleServiceSelect(opt.id)}
                              className={`border rounded-lg p-4 text-left hover:border-blue-400 transition ${
                                service === opt.id ? "border-blue-500 bg-gray-700" : "border-gray-700"
                              }`}
                            >
                              <div className="font-medium">{opt.name}</div>
                              {opt.price && <div className="text-blue-400 font-semibold mt-1">{opt.price}</div>}
                              <div className="text-gray-400 text-sm">Click to select</div>
                            </button>
                          ))}
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <div></div>
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            onClick={next}
                            disabled={!service}
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Select date & time</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Date *</label>
                        {loadingAvail ? (
                          <div className="text-gray-400 text-sm">Loading availability…</div>
                        ) : availableDates.length > 0 ? (
                          <select
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                          >
                            <option value="">Select available date</option>
                            {availableDates.map((d) => (
                              <option key={d} value={d}>{new Date(d).toLocaleDateString()}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="date"
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Time *</label>
                        <input
                          type="time"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button 
                        type="button"
                        className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                        onClick={prev}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        onClick={next}
                        disabled={!date || !time || (availableDates.length > 0 && !availableDates.includes(date))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Your Details */}
                {step === 3 && (
                  <form onSubmit={(e) => { e.preventDefault(); next(); }}>
                    <h3 className="text-xl font-semibold mb-4">Your details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Name *</label>
                        <input
                          type="text"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                          value={details.name}
                          onChange={(e) => setDetails({ ...details, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Email *</label>
                        <input
                          type="email"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                          value={details.email}
                          onChange={(e) => setDetails({ ...details, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Phone</label>
                        <input
                          type="tel"
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none transition"
                          value={details.phone}
                          onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-gray-300 mb-1">Additional Notes</label>
                        <textarea
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-24 focus:border-blue-500 focus:outline-none transition"
                          value={details.notes}
                          onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                          placeholder={service === "other" ? "Any additional information about your custom request..." : "Any special requirements or questions..."}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button 
                        type="button"
                        className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                        onClick={prev}
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
                    <div className="space-y-4 text-gray-300">
                      <div>
                        <span className="text-gray-400 font-medium">Service:</span>
                        <div className="mt-1">
                          {service === "other" ? (
                            <div className="bg-gray-900 rounded p-3">
                              <div><strong>Title:</strong> {customService.title || "Not specified"}</div>
                              <div><strong>Description:</strong> {customService.description || "Not specified"}</div>
                              {customService.budget && <div><strong>Budget:</strong> {customService.budget}</div>}
                            </div>
                          ) : (
                            <div className="bg-gray-900 rounded p-3">
                              {servicePricing[service]?.name || service}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Date:</span>
                        <span>{date || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Time:</span>
                        <span>{time || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Name:</span>
                        <span>{details.name || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">Email:</span>
                        <span>{details.email || "Not specified"}</span>
                      </div>
                      {details.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-medium">Phone:</span>
                          <span>{details.phone}</span>
                        </div>
                      )}
                      {details.notes && (
                        <div>
                          <span className="text-gray-400 font-medium">Additional Notes:</span>
                          <div className="mt-1 bg-gray-900 rounded p-3">{details.notes}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-6">
                      <button 
                        type="button"
                        className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                        onClick={prev}
                      >
                        Back
                      </button>
                      <button 
                        type="button"
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition"
                        onClick={next}
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Payment */}
                {step === 5 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Payment Options</h3>
                    
                    {/* Booking Summary */}
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold mb-4">Booking Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Service:</span>
                          <span>{getServiceDisplayName()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date & Time:</span>
                          <span>{date} at {time}</span>
                        </div>
                        {service !== "other" && paymentAmounts.full > 0 && (
                          <div className="flex justify-between text-lg font-semibold mt-4 pt-4 border-t border-gray-700">
                            <span>Total Amount:</span>
                            <span className="text-blue-400">R{paymentAmounts.full}</span>
                          </div>
                        )}
                        {service === "other" && customService.budget && (
                          <div className="flex justify-between text-lg font-semibold mt-4 pt-4 border-t border-gray-700">
                            <span>Estimated Budget:</span>
                            <span className="text-blue-400">{customService.budget}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentOption("full")}
                        className={`border-2 rounded-lg p-6 text-left transition ${
                          paymentOption === "full" 
                            ? "border-green-500 bg-green-900 bg-opacity-20" 
                            : "border-gray-700 hover:border-green-400"
                        }`}
                      >
                        <h4 className="text-lg font-semibold mb-2">Pay Full Amount</h4>
                        <div className="text-2xl font-bold text-green-400 mb-2">
                          R{paymentAmounts.full || "TBD"}
                        </div>
                        <p className="text-gray-400 text-sm">Secure your booking with full payment</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentOption("deposit")}
                        className={`border-2 rounded-lg p-6 text-left transition ${
                          paymentOption === "deposit" 
                            ? "border-yellow-500 bg-yellow-900 bg-opacity-20" 
                            : "border-gray-700 hover:border-yellow-400"
                        }`}
                      >
                        <h4 className="text-lg font-semibold mb-2">Pay 50% Deposit</h4>
                        <div className="text-2xl font-bold text-yellow-400 mb-2">
                          R{paymentAmounts.deposit || "TBD"}
                        </div>
                        <p className="text-gray-400 text-sm">Pay half now, balance due before service</p>
                      </button>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-yellow-400 mb-2">Payment Information</h4>
                      <p className="text-yellow-200 text-sm">
                        {paymentOption === "deposit" 
                          ? `50% deposit of R${paymentAmounts.deposit} is required to secure your booking. The remaining balance will be due before the service date.`
                          : "Full payment secures your booking and ensures availability for your selected date and time."
                        }
                      </p>
                    </div>

                    <div className="flex justify-between mt-6">
                      <button 
                        type="button"
                        className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
                        onClick={prev}
                      >
                        Back
                      </button>
                      <button 
                        type="button"
                        className="px-6 py-3 rounded bg-green-600 hover:bg-green-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                        onClick={handlePay}
                        disabled={!paymentOption || (service === "other" && !customService.budget)}
                      >
                        Pay Now - R{paymentOption === "full" ? paymentAmounts.full : paymentAmounts.deposit}
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
