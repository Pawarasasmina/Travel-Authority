import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Clock, DollarSign } from 'lucide-react';
import { getAllBookings, updateBookingStatus } from '../../api/adminApi';
import { debugLog } from '../../utils/debug';

interface Booking {
  id: string;
  activityTitle: string;
  activityLocation: string;
  userName?: string;
  userEmail?: string;
  bookingDate: string;
  totalPersons: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  bookingTime: string;
  packageName?: string;
  peopleCounts: Record<string, number>;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      debugLog('ADMIN_BOOKINGS', 'Fetching all bookings');

      const response = await getAllBookings();
      
      if (response.status === 'OK' || response.status === '200 OK') {
        const bookingData = response.data || [];
        setBookings(bookingData);
        debugLog('ADMIN_BOOKINGS', 'Bookings loaded', bookingData);
      } else {
        debugLog('ADMIN_BOOKINGS', 'Failed to get bookings', response);
        setError('Failed to load bookings: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_BOOKINGS', 'Error fetching bookings', err);
      setError('Failed to load bookings: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.activityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      debugLog('ADMIN_BOOKINGS', `Updating booking ${bookingId} status to ${newStatus}`);
      
      const response = await updateBookingStatus(bookingId, newStatus);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        // Update local state
        setBookings(bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
        debugLog('ADMIN_BOOKINGS', 'Booking status updated successfully');
      } else {
        debugLog('ADMIN_BOOKINGS', 'Failed to update booking status', response);
        setError('Failed to update booking status: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_BOOKINGS', 'Error updating booking status', err);
      setError('Failed to update booking status: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Check size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'cancelled':
        return <X size={16} className="text-red-600" />;
      case 'completed':
        return <Check size={16} className="text-blue-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatPeopleCounts = (peopleCounts: Record<string, number>) => {
    if (!peopleCounts) return 'N/A';
    
    const counts = Object.entries(peopleCounts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
    
    return counts || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">Manage Bookings</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign size={16} />
          Total Revenue: LKR {bookings.reduce((sum, booking) => sum + booking.totalPrice, 0).toFixed(2)}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 pl-10 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Filter className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  People
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(booking.bookingTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.activityTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.activityLocation}
                    </div>
                    {booking.packageName && (
                      <div className="text-xs text-blue-600">
                        {booking.packageName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.userName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.userEmail || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.bookingDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {booking.totalPersons} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPeopleCounts(booking.peopleCounts)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      LKR {booking.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              {bookings.length === 0 ? 'No bookings found.' : 'No bookings match your search criteria.'}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedBooking(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Booking Details</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booking ID</label>
                      <p className="text-sm text-gray-900">{selectedBooking.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusIcon(selectedBooking.status)}
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Activity</label>
                    <p className="text-sm text-gray-900">{selectedBooking.activityTitle}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.activityLocation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer</label>
                      <p className="text-sm text-gray-900">{selectedBooking.userName || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.userEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Booking Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total People</label>
                      <p className="text-sm text-gray-900">{selectedBooking.totalPersons}</p>
                      <p className="text-sm text-gray-500">{formatPeopleCounts(selectedBooking.peopleCounts)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-sm text-gray-900">LKR {selectedBooking.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{selectedBooking.paymentMethod}</p>
                    </div>
                  </div>

                  {selectedBooking.packageName && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Package</label>
                      <p className="text-sm text-gray-900">{selectedBooking.packageName}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Booked On</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedBooking.bookingTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingManagement;
