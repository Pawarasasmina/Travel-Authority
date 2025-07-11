import React from 'react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

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

const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase, className = '' }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/bookings/${purchase.id}`);
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
            >
              Download Ticket
            </Button>
          )}
          
          {(purchase.status.toUpperCase() === "PENDING") && (
            <Button
              variant="secondary"
              className="px-6 text-sm h-auto py-3"
            >
              Complete Payment
            </Button>
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
            <button className="text-gray-500 hover:text-red-500 text-sm">
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseCard;
