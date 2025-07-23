import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Clock, DollarSign, Trash2, Download, FileText } from 'lucide-react';
import { getAllBookings, updateBookingStatus, markBookingAsCompleted, deleteBooking, deleteAllBookings } from '../../api/adminApi';
import { debugLog } from '../../utils/debug';
import QRScanner from './QRScanner';
import QRVerificationModal from './QRVerificationModal';
import { exportBookingsToExcel, exportFilteredBookingsToExcel } from '../../utils/excelExporter';

interface Booking {
  id: string;
  activityTitle: string;
  activityLocation: string;
  title?: string;  // Added for compatibility with API response
  location?: string; // Added for compatibility with API response
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

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // QR Scanner states
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    bookingDetails?: any;
  }>({ isValid: false });
  
  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        // Log a sample of the bookings data to check structure
        debugLog('ADMIN_BOOKINGS_RAW', 'Raw booking data sample', 
          bookingData.length > 0 ? bookingData[0] : 'No bookings');
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
      // Fallback to showing all bookings if there's an error
      setFilteredBookings(bookings);
      setError('Error applying filters. Showing all bookings.');
    }
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

  // QR Code scanning functions
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
      debugLog('ADMIN_BOOKINGS', `Marking booking ${scannedQRData.ticketId} as completed`);
      
      // Use the new dedicated API endpoint instead of generic status update
      const response = await markBookingAsCompleted(scannedQRData.ticketId);
      
      if (response.success) {
        debugLog('ADMIN_BOOKINGS', 'Booking marked as completed successfully');
        
        // Show success message
        setSuccessMessage(`Booking ${scannedQRData.ticketId} has been marked as completed`);
        setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
        
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

  const handleQRScanForBooking = (booking: Booking) => {
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

  // Delete handlers
  const handleDeleteBooking = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAllBookings = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      setIsDeleting(true);
      debugLog('ADMIN_BOOKINGS', `Deleting booking ${bookingToDelete}`);
      
      const response = await deleteBooking(bookingToDelete);
      
      if (response.success) {
        setSuccessMessage(`Booking ${bookingToDelete} has been deleted successfully`);
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Refresh bookings list
        await fetchBookings();
      } else {
        throw new Error(response.message || 'Failed to delete booking');
      }
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
    }
  };

  const confirmDeleteAllBookings = async () => {
    try {
      setIsDeleting(true);
      debugLog('ADMIN_BOOKINGS', 'Deleting all bookings');
      
      const response = await deleteAllBookings();
      
      if (response.success) {
        setSuccessMessage('All bookings have been deleted successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Refresh bookings list
        await fetchBookings();
      } else {
        throw new Error(response.message || 'Failed to delete all bookings');
      }
    } catch (err: any) {
      console.error('Error deleting all bookings:', err);
      setError('Failed to delete all bookings: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteAllConfirm(false);
    }
  };

  // Excel export handlers
  const handleExportAllBookings = async () => {
    try {
      // Map bookings to match the expected BookingData format
      const bookingsData = bookings.map(booking => {
        // Make sure title and location are properly set for the Excel export
        return {
          ...booking,
          title: booking.title || booking.activityTitle || 'N/A',
          location: booking.location || booking.activityLocation || 'N/A'
        };
      });
      
      // Debug: Log the data being sent to export
      debugLog('ADMIN_BOOKINGS_EXPORT', 'Exporting bookings data', {
        sample: bookingsData.slice(0, 2),
        count: bookingsData.length,
        sampleWithTitles: bookingsData.slice(0, 2).map(b => ({
          id: b.id,
          title: b.title,
          activityTitle: b.activityTitle,
          location: b.location,
          activityLocation: b.activityLocation
        }))
      });
      
      const result = exportBookingsToExcel(bookingsData);
      if (result.success) {
        setSuccessMessage(`${result.recordCount} bookings exported successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exporting bookings:', error);
      setError('Failed to export bookings to Excel');
    }
  };

  const handleExportFilteredBookings = async () => {
    try {
      // Use the filtered bookings from state instead of re-filtering them
      // Prepare data for export
      const bookingsForExport = filteredBookings.map(booking => {
        // Make sure title and location are properly set for the Excel export
        return {
          ...booking,
          title: booking.title || booking.activityTitle || 'N/A',
          location: booking.location || booking.activityLocation || 'N/A'
        };
      });
      
      // Debug: Log the filtered data being sent to export
      debugLog('ADMIN_BOOKINGS_EXPORT', 'Exporting filtered bookings data', {
        sample: bookingsForExport.slice(0, 2),
        count: bookingsForExport.length,
        filters: { searchTerm, statusFilter },
        sampleWithTitles: bookingsForExport.slice(0, 2).map(b => ({
          id: b.id,
          title: b.title,
          activityTitle: b.activityTitle,
          location: b.location,
          activityLocation: b.activityLocation
        }))
      });
      
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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Booking Management</h1>
                  <p className="text-gray-300">Manage customer bookings and reservations</p>
                </div>
              </div>
              <div className="text-white text-right">
                <div className="text-3xl font-bold">{bookings.length}</div>
                <div className="text-sm text-gray-300">Total Bookings</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center">
                <Check className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center">
                <X className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search bookings by ID, activity or customer..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white appearance-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <Filter className="absolute left-4 top-3.5 text-gray-400" size={18} />
                </div>

                <button
                  onClick={handleQRScan}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h1v3h-1v-3zm2 0h2v1h-2v-1zm0 2h1v2h-1v-2zm1 1h1v1h-1v-1zm-4-4h1v1h-1v-1zm2 0h2v1h-2v-1zm-2 2h2v1h-2v-1zm2-1h1v1h-1v-1z"/>
                  </svg>
                  Scan QR Code
                </button>
                
                {bookings.length > 0 && (
                  <>
                    <div className="flex-col">
                      {(searchTerm || statusFilter == 'ALL') && (
                      <button
                        onClick={handleExportAllBookings}
                        className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Download size={20} className="mr-2" />
                        {(searchTerm || statusFilter !== 'ALL') ? 'Export All' : 'Export'}
                      </button>
                      )}
                      
                      {(searchTerm || statusFilter !== 'ALL') && (
                        <button
                          onClick={handleExportFilteredBookings}
                           className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Download size={20} className="mr-2" />
                        {(searchTerm || statusFilter !== 'ALL') ? 'Export All' : 'Export'}
                      </button>
                      )}
                    </div>
                    
                    <button
                      onClick={handleDeleteAllBookings}
                      className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      disabled={isDeleting}
                    >
                      <Trash2 size={20} className="mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete All'}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-end mb-4">
              <DollarSign size={16} />
              <span>Total Revenue: LKR {bookings.reduce((sum, booking) => sum + booking.totalPrice, 0).toFixed(2)}</span>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        People
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
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
                            <div className="text-sm font-bold text-gray-700">
                              Rs. {booking.totalPrice.toFixed(2)}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                title="View Booking Details"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye size={18} />
                              </button>
                              
                              {booking.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleQRScanForBooking(booking)}
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                  title="Scan QR Code"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h1v3h-1v-3zm2 0h2v1h-2v-1zm0 2h1v2h-1v-2zm1 1h1v1h-1v-1zm-4-4h1v1h-1v-1zm2 0h2v1h-2v-1zm-2 2h2v1h-2v-1zm2-1h1v1h-1v-1z"/>
                                  </svg>
                                </button>
                              )}
                              
                              <select
                                value={booking.status}
                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-black"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>

                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                title="Delete Booking"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                            <p className="text-gray-500">
                              {searchTerm || statusFilter !== 'ALL'
                                ? "No bookings match your search criteria"
                                : "There are no bookings in the system yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-full mr-4">
                      <FileText className="w-6 h-6 text-gray-800" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Booking ID</label>
                      <p className="text-base font-semibold text-gray-900">{selectedBooking.id}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Status</label>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusIcon(selectedBooking.status)}
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 block mb-1">Activity</label>
                    <p className="text-base font-semibold text-gray-900">{selectedBooking.activityTitle}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedBooking.activityLocation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Customer</label>
                      <p className="text-base font-semibold text-gray-900">{selectedBooking.userName || 'N/A'}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedBooking.userEmail || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Booking Date</label>
                      <p className="text-base font-semibold text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Total People</label>
                      <p className="text-base font-semibold text-gray-900">{selectedBooking.totalPersons}</p>
                      <p className="text-sm text-gray-600 mt-1">{formatPeopleCounts(selectedBooking.peopleCounts)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Total Amount</label>
                      <p className="text-base font-semibold text-gray-900">Rs. {selectedBooking.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedBooking.paymentMethod}</p>
                    </div>
                  </div>

                  {selectedBooking.packageName && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Package</label>
                      <p className="text-base font-semibold text-gray-900">{selectedBooking.packageName}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 block mb-1">Booked On</label>
                    <p className="text-base font-semibold text-gray-900">{formatDate(selectedBooking.bookingTime)}</p>
                  </div>
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

      {/* Delete Confirmation Modals */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-full mr-4">
                    <Trash2 className="w-6 h-6 text-gray-800" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Confirm Deletion</h4>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this booking? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteBooking}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showDeleteAllConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowDeleteAllConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-100 rounded-full mr-4">
                    <Trash2 className="w-6 h-6 text-gray-800" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Confirm Deletion</h4>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete all <span className="font-bold text-black">{bookings.length}</span> bookings? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteAllConfirm(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAllBookings}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete All Bookings'}
                  </button>
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
