import React from 'react';
import { PurchaseItem } from './PurchaseCard';
import Button from './Button';
import { QRCodeSVG } from 'qrcode.react';

// Extend PurchaseItem with additional details for the ticket page
interface DetailedTicketInfo extends PurchaseItem {
  bookingTime?: string;
  paymentMethod?: string;
  contactEmail?: string;
  contactPhone?: string;
  ticketInstructions?: string;
  itinerary?: string;
  cancellationPolicy?: string;
  orderNumber?: string;
}

interface BookedTicketDetailProps {
  ticket: DetailedTicketInfo;
  onBack: () => void;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Helper function to get status color - reused from PurchaseCard
const getStatusColor = (status: string) => {
  switch(status) {
    case "Confirmed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const BookedTicketDetail: React.FC<BookedTicketDetailProps> = ({ ticket, onBack }) => {
  // Generate QR code data
  const qrCodeData = JSON.stringify({
    ticketId: ticket.id,
    eventTitle: ticket.title,
    date: ticket.date,
    persons: ticket.persons,
    orderNumber: ticket.orderNumber
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          Back to Bookings
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">Booking Details</h1>
      </div>
      
      {/* Main ticket content */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Ticket header with status */}
        <div className="relative">
          <img 
            src={ticket.image} 
            alt={ticket.title} 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 text-white w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{ticket.title}</h2>
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-lg opacity-90">{ticket.location}</p>
            </div>
          </div>
        </div>
        
        {/* Ticket details */}
        <div className="p-6">
          {/* Booking summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Booking Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium">{ticket.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{ticket.orderNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="font-medium">{ticket.bookingTime ? formatDate(ticket.bookingTime) : 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Travel Date</p>
                  <p className="font-medium">{formatDate(ticket.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Travelers</p>
                  <p className="font-medium">{ticket.persons} {ticket.persons > 1 ? 'Persons' : 'Person'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{ticket.paymentMethod || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Price details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Price Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Base Price</span>
                <span>Rs. {((ticket.price / 1.1) * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Service Fee</span>
                <span>Rs. {((ticket.price / 1.1) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Taxes</span>
                <span>Rs. {(ticket.price - (ticket.price / 1.1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-[#FF7F50]">Rs. {ticket.price.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{ticket.contactEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{ticket.contactPhone || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Itinerary */}
          {ticket.itinerary && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Itinerary</h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{ticket.itinerary}</p>
              </div>
            </div>
          )}
          
          {/* Ticket Instructions */}
          {ticket.ticketInstructions && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Instructions</h3>
              <div className="prose max-w-none">
                <p>{ticket.ticketInstructions}</p>
              </div>
            </div>
          )}
          
          {/* Cancellation Policy */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Cancellation Policy</h3>
            <div className="prose max-w-none">
              <p>{ticket.cancellationPolicy || 'Free cancellation up to 24 hours before the scheduled activity. After that, no refunds will be provided.'}</p>
            </div>
          </div>
          
          {/* QR Code section */}
          {ticket.status === "Confirmed" && (
            <div className="mb-8 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Ticket QR Code</h3>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG
                  value={qrCodeData}
                  size={180}
                  level="H"
                  includeMargin
                  className="mb-2"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Scan this code at the venue</p>
              <p className="text-xs text-gray-400">Ticket ID: {ticket.id}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            {ticket.status === "Confirmed" && (
              <Button
                variant="primary"
                className="px-6 text-sm h-auto py-3 md:w-auto w-full"
              >
                Download Ticket
              </Button>
            )}
            
            {ticket.status === "Pending" && (
              <Button
                variant="secondary"
                className="px-6 text-sm h-auto py-3 md:w-auto w-full"
              >
                Complete Payment
              </Button>
            )}
            
            {(ticket.status === "Confirmed" || ticket.status === "Pending") && (
              <Button
                variant="outline"
                className="px-6 text-sm h-auto py-3 md:w-auto w-full text-red-500 border-red-500 hover:bg-red-50"
              >
                Cancel Booking
              </Button>
            )}
            
            {ticket.status === "Completed" && (
              <Button
                variant="secondary"
                className="px-6 text-sm h-auto py-3 md:w-auto w-full"
              >
                Write Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookedTicketDetail;
