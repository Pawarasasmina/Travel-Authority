import React, { useState, useEffect } from 'react';
import BookedTicketDetail from '../components/ui/BookedTicketDetail';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById } from '../api/bookingApi';

// Extend the booking interface to match the backend response
interface DetailedBookingInfo {
  id: string;
  title: string;
  location: string;
  image: string;
  date: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  price: number;
  persons: number;
  bookingTime?: string;
  paymentMethod?: string;
  contactEmail?: string;
  contactPhone?: string;
  ticketInstructions?: string;
  itinerary?: string;
  cancellationPolicy?: string;
  orderNumber?: string;
  basePrice?: number;
  serviceFee?: number;
  tax?: number;
  totalPrice?: number;
  packageName?: string;
  description?: string;
}

const BookedTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<DetailedBookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) {
        setError('Booking ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBookingById(id);
        
        if (response.success && response.data) {
          // Map backend response to frontend format
          const booking = response.data;
          const formattedBooking: DetailedBookingInfo = {
            id: booking.id,
            title: booking.title,
            location: booking.location,
            image: booking.image || '/src/assets/categories/adventure.jpg', // Default image
            date: booking.bookingDate,
            status: booking.status,
            price: booking.totalPrice,
            persons: booking.totalPersons,
            bookingTime: booking.bookingTime,
            paymentMethod: booking.paymentMethod,
            contactEmail: booking.contactEmail,
            contactPhone: booking.contactPhone,
            ticketInstructions: booking.ticketInstructions,
            itinerary: booking.itinerary,
            cancellationPolicy: booking.cancellationPolicy,
            orderNumber: booking.orderNumber,
            basePrice: booking.basePrice,
            serviceFee: booking.serviceFee,
            tax: booking.tax,
            totalPrice: booking.totalPrice,
            packageName: booking.packageName,
            description: booking.description
          };
          
          setBookingData(formattedBooking);
        } else {
          setError(response.message || 'Failed to fetch booking details');
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to fetch booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleBack = () => {
    navigate('/purchase-list');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading booking details...</div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded max-w-md text-center">
          <h2 className="font-semibold mb-2">Unable to Load Booking</h2>
          <p className="mb-4">{error || 'Booking information not found.'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Bookings
          </button>
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
