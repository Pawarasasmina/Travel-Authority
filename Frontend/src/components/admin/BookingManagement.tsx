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
          {/* Header Section - Enhanced with better styling */}
          <div className="bg-gradient-to-r from-black to-gray-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-white/20 rounded-lg shadow-inner">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Booking Management</h1>
                  <p className="text-gray-300 mt-1">Manage customer bookings and reservations</p>
                </div>
              </div>
              <div className="text-white text-right bg-black/30 px-6 py-3 rounded-lg shadow-inner">
                <div className="text-3xl font-bold">{bookings.length}</div>
                <div className="text-sm text-gray-300">Total Bookings</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success Message - Improved styling */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-1 mr-3">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{successMessage}</span>
                </div>
                <button onClick={() => setSuccessMessage(null)} className="hover:bg-green-100 p-1 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Error Message - Improved styling */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <div className="rounded-full bg-red-100 p-1 mr-3">
                    <X className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
                <button onClick={() => setError(null)} className="hover:bg-red-100 p-1 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Action Bar - Improved with better organization and visual appeal */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
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
                  
                  {/* Added search result count */}
                  {searchTerm && (
                    <div className="mt-2 text-sm text-gray-500">
                      Found {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} matching "{searchTerm}"
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none shadow-sm"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <Filter className="absolute left-4 top-4 text-gray-400" size={18} />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
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
                  
                  {bookings.length > 0 && (
                    <>
                      <div className="flex gap-2">
                        {(searchTerm || statusFilter === 'ALL') && (
                        <button
                          onClick={handleExportAllBookings}
                          className="flex items-center px-6 py-3.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 font-medium shadow-md"
                        >
                          <Download size={20} className="mr-2" />
                          Export All
                        </button>
                        )}
                        
                        {(searchTerm || statusFilter !== 'ALL') && (
                          <button
                            onClick={handleExportFilteredBookings}
                            className="flex items-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md"
                          >
                            <Download size={20} className="mr-2" />
                            Export Filtered
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={handleDeleteAllBookings}
                        className="flex items-center px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md"
                        disabled={isDeleting}
                      >
                        <Trash2 size={20} className="mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete All'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mb-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                <div className="p-2 bg-black rounded-full">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
                  <div className="text-xl font-bold text-gray-900">
                    LKR {bookings.reduce((sum, booking) => sum + booking.totalPrice, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Table - Improved with better styling */}
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
                            <div className="text-sm font-medium text-black">
                              #{booking.id}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created: {formatDate(booking.bookingTime)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.activityTitle}
                            </div>
                            <div className="text-xs text-black flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {booking.activityLocation}
                            </div>
                            {booking.packageName && (
                              <div className="text-xs text-black mt-1 inline-flex items-center  px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                                </svg>
                                {booking.packageName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {booking.userName || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {booking.userEmail || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(booking.bookingDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {booking.totalPersons} total
                            </div>
                            <div className="text-xs text-gray-500 mt-1 ml-5.5">
                              {formatPeopleCounts(booking.peopleCounts)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-700">
                              Rs. {booking.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              {booking.paymentMethod}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h1v3h-1v-3zm2 0h2v1h-2v-1zm0 2h1v2h-1v-2zm1 1h1v1h-1v-1zm-4-4h1v1h-1v-1zm2 0h2v1h-2v-1zm-2 2h2v1h-2v-1zm2-1h1v1h-1v-1z"/>
                                  </svg>
                                </button>
                              )}
                              
                              <select
                                value={booking.status}
                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded-md py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>

                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
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
                            <div className="bg-gray-100 p-5 rounded-full mb-4">
                              <FileText className="w-14 h-14 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                            <p className="text-gray-500 max-w-md">
                              {searchTerm || statusFilter !== 'ALL'
                                ? `No bookings match your search criteria. Try adjusting your filters or search terms.`
                                : "There are no bookings in the system yet. Bookings will appear here when customers make reservations."}
                            </p>
                            {(searchTerm || statusFilter !== 'ALL') && (
                              <button 
                                onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                                className="mt-4 px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                Clear all filters
                              </button>
                            )}
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

      {/* Booking Details Modal - Enhanced with better visual design */}
      {selectedBooking && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-3 bg-white/20 rounded-full mr-4 shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Booking Details</h3>
                      <p className="text-gray-300 text-sm">#{selectedBooking.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Status badge inside header */}
                <div className="mt-4 flex justify-end">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Activity info section with image if available */}
                <div className="bg-gray-50 p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900">Activity Details</h4>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center">
                    {selectedBooking.image && (
                      <div className="w-full md:w-1/4 mr-4 mb-4 md:mb-0">
                        <img 
                          src={selectedBooking.image} 
                          alt={selectedBooking.activityTitle} 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-lg">{selectedBooking.activityTitle}</h5>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {selectedBooking.activityLocation}
                      </div>
                      {selectedBooking.packageName && (
                        <div className="mt-2 inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                          </svg>
                          {selectedBooking.packageName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">Customer</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Name</label>
                        <p className="text-base font-medium text-gray-800">{selectedBooking.userName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Email</label>
                        <p className="text-base text-gray-800">{selectedBooking.userEmail || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">Dates</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Booking Date</label>
                        <p className="text-base font-medium text-gray-800">{formatDate(selectedBooking.bookingDate)}</p>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Created On</label>
                        <p className="text-base text-gray-800">{formatDate(selectedBooking.bookingTime)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* People Count */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">People</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Total</label>
                        <p className="text-base font-medium text-gray-800">{selectedBooking.totalPersons} people</p>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Breakdown</label>
                        <p className="text-base text-gray-800">{formatPeopleCounts(selectedBooking.peopleCounts)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">Payment</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Amount</label>
                        <p className="text-xl font-bold text-green-700">Rs. {selectedBooking.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500">Method</label>
                        <p className="text-base text-gray-800">{selectedBooking.paymentMethod}</p>
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

      {/* Delete Confirmation Modals - Enhanced for better visual appeal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Confirm Deletion</h4>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 mb-3">
                    Are you sure you want to delete this booking? This action cannot be undone.
                  </p>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    Note: All associated customer data and payment information will be permanently removed.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteBooking}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} className="mr-1.5" />
                        Delete Booking
                      </>
                    )}
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
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Delete All Bookings</h4>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Warning: This is a destructive action</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>You are about to delete <span className="font-bold">{bookings.length}</span> booking records from the system.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">
                    Are you sure you want to delete all bookings? This action cannot be undone and will remove all customer booking data from the system.
                  </p>
                  
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    Note: All associated customer data, payment records, and activity booking information will be permanently removed.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteAllConfirm(false)}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAllBookings}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting All...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} className="mr-1.5" />
                        Delete All Bookings
                      </>
                    )}
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
