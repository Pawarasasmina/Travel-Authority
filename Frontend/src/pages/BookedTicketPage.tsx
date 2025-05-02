import React, { useState, useEffect } from 'react';
import BookedTicketDetail from '../components/ui/BookedTicketDetail';
import { PurchaseItem } from '../components/ui/PurchaseCard';
import { useParams, useNavigate } from 'react-router-dom';

const BookedTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, you would fetch the ticket data from an API
    // For demo purposes, we're creating mock data
    setTimeout(() => {
      const mockTicket = {
        id: id || "TICK-12345",
        title: "Wildlife Safari Adventure",
        location: "Yala National Park, Sri Lanka",
        image: "https://images.unsplash.com/photo-1581335663563-270d361191ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        date: "2023-11-15T09:30:00",
        status: "Confirmed" as const,
        price: 12500,
        persons: 2,
        bookingTime: "2023-10-20T14:23:00",
        paymentMethod: "Credit Card",
        contactEmail: "customer@example.com",
        contactPhone: "+94 71 234 5678",
        ticketInstructions: "Please arrive 30 minutes before the scheduled time. Bring your ID and the booking confirmation. Wear comfortable clothing and bring sun protection.",
        itinerary: "07:30 - Pickup from hotel\n09:00 - Arrival at Yala National Park\n09:30 - Safari begins\n12:30 - Lunch break\n13:30 - Continue safari\n16:30 - Return to entrance\n18:00 - Drop-off at hotel",
        cancellationPolicy: "Free cancellation up to 48 hours before the scheduled activity. 50% refund for cancellations between 48 and 24 hours. No refunds for cancellations less than 24 hours before the activity.",
        orderNumber: "ORD-98765"
      };
      
      setTicket(mockTicket);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleBack = () => {
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {ticket && <BookedTicketDetail ticket={ticket} onBack={handleBack} />}
    </div>
  );
};

export default BookedTicketPage;
