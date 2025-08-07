import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Clock, DollarSign, FileText, Calendar, Users, MapPin } from 'lucide-react';
import { getOwnerBookings, updateOwnerBookingStatus, markOwnerBookingAsCompleted } from '../../api/ownerApi';
import { debugLog } from '../../utils/debug';
import { useAuth } from '../../hooks/useAuth';
import QRScanner from '../admin/QRScanner';
import QRVerificationModal from '../admin/QRVerificationModal';
import { exportBookingsToExcel, exportFilteredBookingsToExcel } from '../../utils/excelExporter';

interface OwnerBooking {
  id: string;
  activityTitle: string;
  activityLocation: string;
  title?: string;
  location?: string;
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
  image?: string;
}

const TravelOwnerBookingManagement: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<OwnerBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<OwnerBooking | null>(null);
  
  // QR Scanner states
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    bookingDetails?: any;
  }>({ isValid: false });

  useEffect(() => {
    // Only fetch bookings when authentication is complete and user is available
    if (!authLoading && user) {
      fetchBookings();
    } else if (!authLoading && !user) {
      setError('Authentication required. Please log in.');
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      debugLog('OWNER_BOOKINGS', 'Fetching owner bookings');

      // Debug authentication state
      const token = localStorage.getItem('token');
      const userLocalStorage = localStorage.getItem('user');
      debugLog('OWNER_BOOKINGS', 'Auth state check', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUser: !!userLocalStorage,
        hasAuthUser: !!user,
        userRole: user?.role || (userLocalStorage ? JSON.parse(userLocalStorage).role : 'no user')
      });

      // Check if user is authenticated and has proper role
      if (!user) {
        setError('User not authenticated. Please log in again.');
        return;
      }

      if (user.role !== 'TRAVEL_ACTIVITY_OWNER') {
        setError('Access denied: Travel activity owner role required.');
        return;
      }

      const response = await getOwnerBookings();
      
      debugLog('OWNER_BOOKINGS', 'Raw API response', response);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        const bookingData = response.data || [];
        debugLog('OWNER_BOOKINGS_RAW', 'Raw booking data sample', 
          bookingData.length > 0 ? bookingData[0] : 'No bookings');
        setBookings(bookingData);
        debugLog('OWNER_BOOKINGS', 'Owner bookings loaded', bookingData);
      } else {
        debugLog('OWNER_BOOKINGS', 'Failed to get owner bookings', response);
        const errorMessage = response.message || 'Unknown error occurred';
        setError('Failed to load bookings: ' + errorMessage);
      }
    } catch (err: any) {
      debugLog('OWNER_BOOKINGS', 'Error fetching owner bookings', err);
      const errorMessage = err.message || 'Network error or server unavailable';
      setError('Failed to load bookings: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    try {
      let filtered = bookings;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(booking =>
          (booking.activityTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (booking.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (booking.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (booking.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      // Filter by status
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter(booking => booking.status === statusFilter);
      }

      setFilteredBookings(filtered);
    } catch (err) {
      console.error('Error filtering bookings:', err);
      setFilteredBookings(bookings);
      setError('Error applying filters. Showing all bookings.');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      debugLog('OWNER_BOOKINGS', `Updating booking ${bookingId} status to ${newStatus}`);
      
      const response = await updateOwnerBookingStatus(bookingId, newStatus);
      
      if (response.status === 'OK' || response.status === '200 OK') {
        // Update local state
        setBookings(bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
        debugLog('OWNER_BOOKINGS', 'Booking status updated successfully');
        setSuccessMessage(`Booking ${bookingId} status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        debugLog('OWNER_BOOKINGS', 'Failed to update booking status', response);
        setError('Failed to update booking status: ' + response.message);
      }
    } catch (err: any) {
      debugLog('OWNER_BOOKINGS', 'Error updating booking status', err);
      setError('Failed to update booking status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = async (scannedData: any) => {
    try {
      setScannedQRData(scannedData);
      setShowQRScanner(false);

      // Use backend verification result if available
      if (scannedData.backendData) {
        setVerificationResult({
          isValid: true,
          bookingDetails: scannedData.backendData
        });
      } else {
        // Fallback to local verification (for compatibility)
        const booking = bookings.find(b => b.id === scannedData.ticketId);
        
        if (booking) {
          setVerificationResult({
            isValid: true,
            bookingDetails: booking
          });
        } else {
          setVerificationResult({
            isValid: false
          });
        }
      }
      
      setShowVerificationModal(true);
    } catch (err) {
      console.error('Error processing QR scan:', err);
      setError('Failed to process QR code scan');
    }
  };

  const handleMarkAsUsed = async () => {
    if (!scannedQRData) return;
    
    try {
      debugLog('OWNER_BOOKINGS', `Marking booking ${scannedQRData.ticketId} as completed`);
      
      const response = await markOwnerBookingAsCompleted(scannedQRData.ticketId);
      
      if (response.success || response.status === 'OK') {
        debugLog('OWNER_BOOKINGS', 'Booking marked as completed successfully');
        
        // Show success message
        setSuccessMessage(`Booking ${scannedQRData.ticketId} has been marked as completed`);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Close modal and clear state
        setShowVerificationModal(false);
        setScannedQRData(null);
        setVerificationResult({ isValid: false });
        
        // Refresh bookings to show updated status
        await fetchBookings();
      } else {
        throw new Error(response.message || 'Failed to mark booking as completed');
      }
      
    } catch (err: any) {
      console.error('Error marking booking as used:', err);
      setError('Failed to mark booking as completed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleQRScanForBooking = (booking: OwnerBooking) => {
    setSelectedBooking(booking);
    setShowQRScanner(true);
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

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleExportAllBookings = async () => {
    try {
      const bookingsForExport = bookings.map(b => ({
        ...b,
        title: b.title || b.activityTitle || '',
        location: b.location || b.activityLocation || '',
        activity: {
          id: b.id,
          title: b.title || b.activityTitle || '',
          activityTitle: b.activityTitle || '',
          location: b.location || b.activityLocation || '',
          activityLocation: b.activityLocation || ''
        }
      }));
      
      const result = exportBookingsToExcel(bookingsForExport);
      
      if (result.success) {
        setSuccessMessage(`${result.recordCount} bookings exported successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exporting all bookings:', error);
      setError('Failed to export bookings to Excel');
    }
  };

  const handleExportFilteredBookings = async () => {
    try {
      const bookingsForExport = filteredBookings.map(b => ({
        ...b,
        title: b.title || b.activityTitle || '',
        location: b.location || b.activityLocation || '',
        activity: {
          id: b.id,
          title: b.title || b.activityTitle || '',
          activityTitle: b.activityTitle || '',
          location: b.location || b.activityLocation || '',
          activityLocation: b.activityLocation || ''
        }
      }));
      
      const result = exportFilteredBookingsToExcel(
        bookingsForExport,
        {
          searchTerm: searchTerm,
          statusFilter: statusFilter
        }
      );
      
      if (result.success) {
        setSuccessMessage(`${result.recordCount} filtered bookings exported successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exporting filtered bookings:', error);
      setError('Failed to export filtered bookings to Excel');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">
          {authLoading ? 'Authenticating...' : 'Loading bookings...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold mb-2">Error loading bookings</p>
          <p className="mb-3">{error}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setError(null);
                if (!authLoading && user) {
                  fetchBookings();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                // Force a complete re-authentication
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Re-login
            </button>
          </div>
        </div>
        
        {/* Show some debug info if error persists */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
          <p className="font-semibold mb-1">Debug Information:</p>
          <p>User authenticated: {!!user ? 'Yes' : 'No'}</p>
          <p>User role: {user?.role || 'None'}</p>
          <p>Auth loading: {authLoading ? 'Yes' : 'No'}</p>
          <p>Token exists: {!!localStorage.getItem('token') ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Activity Bookings</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (!authLoading && user) {
                fetchBookings();
              }
            }}
            disabled={authLoading || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            Total: {bookings.length} bookings
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <div className="text-2xl font-bold text-gray-900">
                LKR {bookings.reduce((sum, booking) => sum + booking.totalPrice, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings by ID, activity or customer..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            </div>
            
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-500">
                Found {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} matching "{searchTerm}"
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Filter className="absolute right-3 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex gap-2">
              {(searchTerm || statusFilter === 'ALL') && (
              <button
                onClick={handleExportAllBookings}
                className="flex items-center px-6 py-3.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 font-medium shadow-md"
              >
                <FileText size={20} className="mr-2" />
                Export All
              </button>
              )}
              
              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={handleExportFilteredBookings}
                  className="flex items-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md"
                >
                  <FileText size={20} className="mr-2" />
                  Export Filtered
                </button>
              )}
            </div>
            
            <button
              onClick={handleQRScan}
              className="flex items-center px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h1v3h-1v-3zm2 0h2v1h-2v-1zm0 2h1v2h-1v-2zm1 1h1v1h-1v-1zm-4-4h1v1h-1v-1zm2 0h2v1h-2v-1zm-2 2h2v1h-2v-1zm2-1h1v1h-1v-1z"/>
              </svg>
              Scan QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  People
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {booking.activityTitle || booking.title}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {booking.activityLocation || booking.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.userName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {booking.bookingDate}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateTime(booking.bookingTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Users size={14} className="mr-1" />
                        {booking.totalPersons}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        LKR {booking.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">{booking.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(booking.status)}
                        <select
                          className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(booking.status)}`}
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                          title="View Booking Details"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye size={18} />
                        </button>
                        
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleQRScanForBooking(booking)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors duration-200"
                            title="Scan QR Code"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No bookings found</h3>
                      <p className="mt-1">
                        {searchTerm || statusFilter !== 'ALL'
                          ? 'Try adjusting your search or filter criteria.'
                          : 'No bookings have been made for your activities yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSelectedBooking(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Booking Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Booking ID:</span>
                        <p className="font-medium">{selectedBooking.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Activity:</span>
                        <p className="font-medium">{selectedBooking.activityTitle}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">{selectedBooking.bookingDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">People Count:</span>
                        <p className="font-medium">{selectedBooking.totalPersons}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <p className="font-medium">{selectedBooking.userName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{selectedBooking.userEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Payment Method:</span>
                        <p className="font-medium">{selectedBooking.paymentMethod}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Amount:</span>
                        <p className="font-medium">LKR {selectedBooking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  {selectedBooking.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => { 
                        setSelectedBooking(null);
                        setTimeout(() => handleQRScanForBooking(selectedBooking), 100);
                      }}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
                      </svg>
                      Scan QR Code
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => {
          setShowQRScanner(false);
          setSelectedBooking(null);
        }}
        onScanSuccess={handleQRScanSuccess}
        expectedBookingId={selectedBooking?.id}
        mode="owner"
      />

      {/* QR Verification Modal */}
      <QRVerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          setShowVerificationModal(false);
          setScannedQRData(null);
          setVerificationResult({ isValid: false });
        }}
        scannedData={scannedQRData}
        bookingDetails={verificationResult.bookingDetails}
        isValid={verificationResult.isValid}
        onMarkAsUsed={handleMarkAsUsed}
      />
    </div>
  );
};

export default TravelOwnerBookingManagement;
