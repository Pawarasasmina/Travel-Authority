import React, { useState, useEffect } from 'react';
import BookedTicketDetail from '../components/ui/BookedTicketDetail';
import { PurchaseItem } from '../components/ui/PurchaseCard';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const BookedTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state;

  const handleBack = () => {
    navigate('/purchase-list');
  };

  if (!bookingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Booking information not found. Please check your bookings list.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BookedTicketDetail 
        ticket={bookingData} 
        onBack={handleBack}
      />
    </div>
  );
};

export default BookedTicketPage;
