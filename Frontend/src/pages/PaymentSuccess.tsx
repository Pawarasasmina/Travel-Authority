import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  useEffect(() => {
    // Automatically redirect to ticket details after 3 seconds
    const timer = setTimeout(() => {
      navigate(`/bookings/${bookingData.id}`, { state: bookingData });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your booking for {bookingData?.title} has been confirmed.
        </p>
        <div className="text-sm text-gray-500">
          Redirecting to your ticket details...
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
