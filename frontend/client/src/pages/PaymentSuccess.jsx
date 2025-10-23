import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import buildApiUrl from '../utils/api';

export default function PaymentSuccess() {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get('m_payment_id');
    
    if (!orderId) {
      setError('No order ID found');
      setLoading(false);
      return;
    }

    // Fetch payment status
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(buildApiUrl(`/payments/payment_success.php?m_payment_id=${orderId}`));
        const data = await response.json();
        
        if (data.success) {
          setPaymentData(data);
          // Auto-redirect to profile after 3 seconds with countdown
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                navigate('/profile');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError(data.error || 'Failed to fetch payment status');
        }
      } catch (err) {
        setError('Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [searchParams]);

  const handlePayRemaining = () => {
    if (paymentData) {
      // Redirect to booking page with payment for remaining amount
      navigate(`/bookings?remaining_amount=${paymentData.remaining_amount}&order_id=${paymentData.order_id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06d6a0] mx-auto mb-4"></div>
            <p>Loading payment status...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">Payment Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/bookings')}
              className="bg-[#06d6a0] text-black px-6 py-3 rounded font-bold hover:bg-[#05b389] transition"
            >
              Return to Bookings
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <p>No payment data available</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFullPayment = paymentData.is_full_payment;
  const isDeposit = paymentData.is_deposit;

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-gray-400">Your payment has been processed successfully</p>
              <p className="text-blue-400 text-sm mt-2">
                Redirecting to your profile in {countdown} seconds...
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Order ID:</p>
                  <p className="font-semibold">{paymentData.order_id}</p>
                </div>
                <div>
                  <p className="text-gray-400">Service:</p>
                  <p className="font-semibold">{paymentData.service_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Customer:</p>
                  <p className="font-semibold">{paymentData.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Email:</p>
                  <p className="font-semibold">{paymentData.customer_email}</p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
              
              {isFullPayment ? (
                <div className="text-center">
                  <div className="text-green-500 text-4xl mb-2">💰</div>
                  <p className="text-lg font-semibold text-green-400">Full Payment Complete</p>
                  <p className="text-gray-400">Amount Paid: R {paymentData.paid_amount.toFixed(2)}</p>
                </div>
              ) : isDeposit ? (
                <div className="text-center">
                  <div className="text-yellow-500 text-4xl mb-2">💳</div>
                  <p className="text-lg font-semibold text-yellow-400">Deposit Payment Received</p>
                  <p className="text-gray-400 mb-4">
                    Amount Paid: R {paymentData.paid_amount.toFixed(2)} of R {paymentData.service_amount.toFixed(2)}
                  </p>
                  <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-200 mb-2">
                      <strong>Remaining Amount:</strong> R {paymentData.remaining_amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-yellow-300">
                      The remaining balance will be due before your service date.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-semibold">Payment Received</p>
                  <p className="text-gray-400">Amount: R {paymentData.paid_amount.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isDeposit && paymentData.remaining_amount > 0 && (
                <button
                  onClick={handlePayRemaining}
                  className="bg-yellow-600 text-white px-6 py-3 rounded font-bold hover:bg-yellow-500 transition"
                >
                  Pay Remaining R {paymentData.remaining_amount.toFixed(2)}
                </button>
              )}
              
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-500 transition"
              >
                View My Orders & Bookings
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-6 py-3 rounded font-bold hover:bg-gray-500 transition"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
