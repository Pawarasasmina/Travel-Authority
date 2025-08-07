import React, { useState } from 'react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { generateSimpleTicketPDF } from '../../utils/pdfGenerator';

// Define the purchase item interface
export interface PurchaseItem {
  id: string;
  title: string;
  location: string;
  image: string;
  date: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled" | "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
  price: number;
  persons: number;
}

interface PurchaseCardProps {
  purchase: PurchaseItem;
  className?: string;
  onCancelBooking?: (bookingId: string) => Promise<void>;
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch(status.toUpperCase()) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase, className = '', onCancelBooking }) => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleViewDetails = () => {
    navigate(`/bookings/${purchase.id}`);
  };

  const handleCancelBooking = async () => {
    if (!onCancelBooking) return;
    
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsCancelling(true);
      try {
        await onCancelBooking(purchase.id);
      } catch (error) {
        console.error('Error cancelling booking:', error);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleDownloadTicket = async () => {
    try {
      await generateSimpleTicketPDF({
        ...purchase,
        orderNumber: `ORD-${purchase.id}`,
        bookingTime: new Date().toISOString(),
        paymentMethod: 'Credit Card',
        contactEmail: 'support@tickets.lk',
        contactPhone: '+94 11 234 5678'
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  // Helper: Check if booking can be cancelled (>= 3 days from today)
  const canCancelBooking = () => {
    const bookingDate = new Date(purchase.date);
    const today = new Date();
    // Set both dates to midnight for accurate diff
    bookingDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="md:w-1/4 h-60 md:h-auto overflow-hidden">
        <img 
          src={purchase.image} 
          alt={purchase.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-6 md:w-3/4 flex flex-col md:flex-row justify-between">
        <div className="flex-grow mb-4 md:mb-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">{purchase.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status)}`}>
              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Location: {purchase.location}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-medium">{purchase.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Travel Date</p>
              <p className="font-medium">{formatDate(purchase.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Travelers</p>
              <p className="font-medium">{purchase.persons} {purchase.persons > 1 ? 'Persons' : 'Person'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-bold text-[#FF7F50]">Rs. {purchase.price.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-center gap-3 md:ml-6">
          <Button
            variant="primary"
            className="px-6 text-sm h-auto py-3"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          
          {(purchase.status.toUpperCase() === "CONFIRMED") && (
            <Button
              variant="outline"
              className="px-6 text-sm h-auto py-3"
              onClick={handleDownloadTicket}
            >
              Download Ticket
            </Button>
          )}
          
          {(purchase.status.toUpperCase() === "PENDING") && (
            <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-center">
              <span className="text-xs text-yellow-800 font-medium">Awaiting Confirmation</span>
            </div>
          )}
          
          {(purchase.status.toUpperCase() === "COMPLETED") && (
            <Button
              variant="secondary"
              className="px-6 text-sm h-auto py-3"
            >
              Write Review
            </Button>
          )}
          
          {(purchase.status.toUpperCase() === "CONFIRMED" || purchase.status.toUpperCase() === "PENDING") && (
            <button 
              className={`text-gray-500 hover:text-red-500 text-sm ${!canCancelBooking() ? "opacity-50 cursor-not-allowed" : ""}`} 
              onClick={canCancelBooking() ? handleCancelBooking : undefined}
              disabled={isCancelling || !canCancelBooking()}
              title={!canCancelBooking() ? "Cannot cancel less than 3 days before booking date" : undefined}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCard;
