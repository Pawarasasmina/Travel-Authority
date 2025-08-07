import React from 'react';
import { PurchaseItem } from './PurchaseCard';
import Button from './Button';
import { QRCodeSVG } from 'qrcode.react';
import { generateSimpleTicketPDF } from '../../utils/pdfGenerator';

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
  basePrice?: number;
  serviceFee?: number;
  tax?: number;
  totalPrice?: number;
  packageName?: string;
  packageFeatures?: string[];
  description?: string;
  peopleCounts?: Record<string, number>;
  qrCodeData?: string; // QR code data from backend
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

const BookedTicketDetail: React.FC<BookedTicketDetailProps> = ({ ticket, onBack }) => {
  // Use QR code data from backend if available, otherwise generate fallback
  const getQRCodeData = () => {
    if (ticket.qrCodeData) {
      console.log('Using backend QR code data:', ticket.qrCodeData);
      return ticket.qrCodeData;
    }
    
    // Fallback QR code generation (for compatibility)
    const baseData = {
      ticketId: ticket.id,
      eventTitle: ticket.title,
      date: ticket.date,
      persons: ticket.persons,
      orderNumber: ticket.orderNumber,
      status: ticket.status,
      verificationCode: `VER-${ticket.id}-${Date.parse(ticket.date)}` // Simple verification code
    };
    const fallbackData = JSON.stringify(baseData);
    console.log('Using fallback QR code data:', fallbackData);
    return fallbackData;
  };

  const handleDownloadTicket = async () => {
    try {
      await generateSimpleTicketPDF({
        ...ticket,
        orderNumber: ticket.orderNumber || `ORD-${ticket.id}`,
        bookingTime: ticket.bookingTime || new Date().toISOString(),
        paymentMethod: ticket.paymentMethod || 'Credit Card',
        contactEmail: ticket.contactEmail || 'support@tickets.lk',
        contactPhone: ticket.contactPhone || '+94 11 234 5678'
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  // Helper: Check if booking can be cancelled (>= 3 days from today)
  const canCancelBooking = () => {
    const bookingDate = new Date(ticket.date);
    const today = new Date();
    bookingDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  const qrCodeData = getQRCodeData();
  
  // Debug logging
  console.log('Ticket status:', ticket.status);
  console.log('Status check result:', ticket.status.toUpperCase() === "CONFIRMED");
  console.log('QR Code data length:', qrCodeData.length);

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
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-lg opacity-90">{ticket.location}</p>
            </div>
          </div>
        </div>
        
        {/* Ticket details */}
        <div className="p-6">
          {/* Status notification for pending bookings */}
          {ticket.status.toUpperCase() === "PENDING" && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Booking Pending Confirmation</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your booking has been submitted successfully and is awaiting admin confirmation. 
                    You will be notified once your booking is confirmed and your QR code becomes available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status notification for confirmed bookings */}
          {ticket.status.toUpperCase() === "CONFIRMED" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-green-800">Booking Confirmed</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your booking has been confirmed! Please present your QR code at the venue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking details */}
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
                  {/* Ticket breakdown */}
                  {ticket.peopleCounts && Object.keys(ticket.peopleCounts).some(key => ticket.peopleCounts![key] > 0) && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2 font-medium">Ticket Breakdown:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {ticket.peopleCounts.foreignAdult > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Foreign Adult:</span>
                            <span className="font-medium">{ticket.peopleCounts.foreignAdult}</span>
                          </div>
                        )}
                        {ticket.peopleCounts.foreignKids > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Foreign Kid:</span>
                            <span className="font-medium">{ticket.peopleCounts.foreignKids}</span>
                          </div>
                        )}
                        {ticket.peopleCounts.localAdult > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Local Adult:</span>
                            <span className="font-medium">{ticket.peopleCounts.localAdult}</span>
                          </div>
                        )}
                        {ticket.peopleCounts.localKids > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Local Kid:</span>
                            <span className="font-medium">{ticket.peopleCounts.localKids}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{ticket.paymentMethod || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Package Details */}
          {(ticket.packageName || (ticket.packageFeatures && ticket.packageFeatures.length > 0)) && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Package Details</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                {ticket.packageName && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Package Type</p>
                    <p className="font-medium text-lg text-blue-800">{ticket.packageName}</p>
                  </div>
                )}
                {ticket.packageFeatures && ticket.packageFeatures.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Package Features</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {ticket.packageFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Price details */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Price Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {ticket.basePrice && (
                <div className="flex justify-between mb-2">
                  <span>Base Price</span>
                  <span>Rs. {ticket.basePrice.toLocaleString()}</span>
                </div>
              )}
              {ticket.serviceFee && (
                <div className="flex justify-between mb-2">
                  <span>Service Fee</span>
                  <span>Rs. {ticket.serviceFee.toLocaleString()}</span>
                </div>
              )}
              {ticket.tax && (
                <div className="flex justify-between mb-2">
                  <span>Taxes</span>
                  <span>Rs. {ticket.tax.toLocaleString()}</span>
                </div>
              )}
              {!ticket.basePrice && !ticket.serviceFee && !ticket.tax && (
                <>
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
                </>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Amount</span>
                <span className="text-[#FF7F50]">Rs. {(ticket.totalPrice || ticket.price).toLocaleString()}</span>
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
          {(ticket.status.toUpperCase() === "CONFIRMED") && (
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
            {ticket.status.toUpperCase() === "CONFIRMED" && (
              <Button
                variant="primary"
                className="px-6 text-sm h-auto py-3 md:w-auto w-full"
                onClick={handleDownloadTicket}
              >
                Download Ticket
              </Button>
            )}
            
            {ticket.status.toUpperCase() === "PENDING" && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800">Awaiting Admin Confirmation</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Your payment has been processed successfully. We will notify you once your booking is confirmed by our team.
                </p>
              </div>
            )}
            
            {(ticket.status.toUpperCase() === "CONFIRMED" || ticket.status.toUpperCase() === "PENDING") && (
              <Button
                variant="outline"
                className={`px-6 text-sm h-auto py-3 md:w-auto w-full text-red-500 border-red-500 hover:bg-red-50 ${!canCancelBooking() ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!canCancelBooking()}
                title={!canCancelBooking() ? "Cannot cancel less than 3 days before booking date" : undefined}
              >
                Cancel Booking
              </Button>
            )}
            
            {ticket.status.toUpperCase() === "COMPLETED" && (
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
