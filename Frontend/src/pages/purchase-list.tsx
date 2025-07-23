import { useState, useEffect, useCallback } from "react";
import PurchaseCard, { PurchaseItem } from '../components/ui/PurchaseCard';
import { getUserBookings, cancelBooking } from '../api/bookingApi';
import { useAlert } from "../contexts/AlertContext";

const PurchaseList = () => {
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<string>("All");
  const [purchaseData, setPurchaseData] = useState<PurchaseItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to handle booking cancellation
  const handleCancelBooking = async (bookingId: string): Promise<void> => {
    try {
      const response = await cancelBooking(bookingId);
      
      if (response.success) {
        // Update the UI to reflect the cancellation
        setPurchaseData(prevData => 
          prevData.map(item => 
            item.id === bookingId ? { ...item, status: "CANCELLED" } : item
          )
        );
        
        // Refresh the status counts
        fetchStatusCounts();
        
        // Show success message
        await showAlert("Booking cancelled successfully", "Success");
      } else {
        throw new Error(response.message || "Failed to cancel booking");
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      await showAlert(
        error.message || "There was an error cancelling your booking. Please try again.",
        "Error"
      );
      throw error; // Re-throw to be caught by the component
    }
  };

  // Fetch status counts for filter buttons
  const fetchStatusCounts = useCallback(async () => {
    try {
      const backendStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
      const frontendStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
      const counts: Record<string, number> = {};
      
      // Fetch all bookings to get total count
      const allResponse = await getUserBookings();
      counts["All"] = allResponse.success && allResponse.data ? allResponse.data.length : 0;
      
      // Fetch counts for each status
      for (let i = 0; i < backendStatuses.length; i++) {
        const backendStatus = backendStatuses[i];
        const frontendStatus = frontendStatuses[i];
        const response = await getUserBookings(backendStatus);
        counts[frontendStatus] = response.success && response.data ? response.data.length : 0;
      }
      
      setStatusCounts(counts);
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  }, []);  // Empty dependency array

  // Initial fetch of status counts
  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Map frontend filter to backend status
        let statusParam: string | undefined;
        if (filter !== "All") {
          const statusMapping: Record<string, string> = {
            "Pending": "PENDING",
            "Confirmed": "CONFIRMED", 
            "Completed": "COMPLETED",
            "Cancelled": "CANCELLED"
          };
          statusParam = statusMapping[filter];
        }
        
        // This should only return the current user's bookings based on their authentication token
        const response = await getUserBookings(statusParam);
        
        if (response.success && response.data) {
          // Convert backend booking format to frontend format
          // First, filter out bookings that don't belong to the current user
          const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
          
          // Filter bookings by userEmail if available in the response data
          const filteredBookings = response.data.filter((booking: any) => {
            // If booking has userEmail field, make sure it matches the current user
            // If it doesn't have a userEmail field, we'll assume it's for the current user
            // since the backend should be filtering based on the auth token
            return !booking.userEmail || booking.userEmail === userEmail;
          });
          
          const formattedBookings: PurchaseItem[] = filteredBookings.map((booking: any) => ({
            id: booking.id,
            title: booking.title,
            location: booking.location,
            image: booking.image || '/src/assets/categories/adventure.jpg', // Default image if none provided
            date: booking.bookingDate,
            status: booking.status,
            price: booking.totalPrice,
            persons: booking.totalPersons
          }));
          
          setPurchaseData(formattedBookings);
        } else {
          setError(response.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filter]);

  // Update status counts when filter changes (except for the initial "All" fetch)
  useEffect(() => {
    if (filter !== "All") {
      // Update the count for the current filter based on the fetched data
      setStatusCounts(prev => ({
        ...prev,
        [filter]: purchaseData.length
      }));
    }
  }, [purchaseData, filter]);

  // Count bookings by status
  const getCountByStatus = (status: string) => {
    return statusCounts[status] || 0;
  };

  if (loading) {
    return (
      <div className="pt-[52px] container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[52px] container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-xl">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col mt-8">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-6">My Purchases</h1>
          <p className="text-lg mb-8">View and manage all your booked travel experiences.</p>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map((filterOption) => (
              <button 
                key={filterOption}
                onClick={() => setFilter(filterOption)} 
                className={`px-4 py-2 rounded-full border transition-colors ${
                  filter === filterOption 
                    ? 'bg-gradient-to-r from-[#FF7F50] to-[#BF360C] text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {filterOption} ({getCountByStatus(filterOption)})
              </button>
            ))}
          </div>
          
          {/* Purchases List */}
          <div className="space-y-6">
            {purchaseData.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xl">No purchases found for the selected filter.</p>
              </div>
            ) : (
              purchaseData.map(purchase => (
                <PurchaseCard 
                  key={purchase.id} 
                  purchase={purchase} 
                  onCancelBooking={handleCancelBooking} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PurchaseList;
