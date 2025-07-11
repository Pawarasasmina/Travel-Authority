import React from 'react';
import { CheckCircle, AlertCircle, Calendar, Users, MapPin, CreditCard, X } from 'lucide-react';
import Button from '../ui/Button';

interface QRVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedData: any;
  bookingDetails?: any; // Optional: fetch from backend to verify
  isValid: boolean;
  onMarkAsUsed?: () => void;
}

const QRVerificationModal: React.FC<QRVerificationModalProps> = ({
  isOpen,
  onClose,
  scannedData,
  bookingDetails,
  isValid,
  onMarkAsUsed
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            {isValid ? (
              <CheckCircle size={24} className="text-green-600 mr-3" />
            ) : (
              <AlertCircle size={24} className="text-red-600 mr-3" />
            )}
            <h2 className="text-xl font-semibold">
              {isValid ? 'Valid Ticket Verified' : 'Invalid Ticket'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isValid ? (
            <div className="space-y-6">
              {/* Verification Success */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">Ticket verification successful!</p>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  This is a valid ticket for the specified event.
                </p>
              </div>

              {/* Ticket Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking ID</label>
                    <p className="text-lg font-semibold">{scannedData.ticketId}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Event</label>
                    <p className="text-lg">{scannedData.eventTitle}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Number</label>
                    <p className="text-lg">{scannedData.orderNumber || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scannedData.status)}`}>
                      {scannedData.status}
                    </span>
                  </div>

                  {/* Show current booking status from backend */}
                  {scannedData.backendData && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scannedData.backendData.status)}`}>
                        {scannedData.backendData.status}
                      </span>
                      {scannedData.backendData.status === 'COMPLETED' && (
                        <p className="text-sm text-green-600 mt-1">✓ This booking has been marked as completed</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar size={18} className="text-gray-500 mr-2" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Event Date</label>
                      <p className="text-lg">{formatDate(scannedData.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users size={18} className="text-gray-500 mr-2" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Number of Persons</label>
                      <p className="text-lg">{scannedData.persons}</p>
                    </div>
                  </div>

                  {bookingDetails && (
                    <>
                      <div className="flex items-center">
                        <MapPin size={18} className="text-gray-500 mr-2" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="text-lg">{bookingDetails.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <CreditCard size={18} className="text-gray-500 mr-2" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Paid</label>
                          <p className="text-lg font-semibold text-green-600">
                            Rs. {bookingDetails.totalPrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {bookingDetails && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Booking Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Customer Email:</span>
                      <p className="font-medium">{bookingDetails.userEmail}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Customer Name:</span>
                      <p className="font-medium">{bookingDetails.userName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Payment Method:</span>
                      <p className="font-medium">{bookingDetails.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Booking Date:</span>
                      <p className="font-medium">
                        {new Date(bookingDetails.bookingTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Verification Details</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>✓ QR Code format is valid</p>
                  <p>✓ Verification code matches booking</p>
                  <p>✓ Ticket ID exists in system</p>
                  <p>✓ No tampering detected</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Failed */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-600 mr-2" />
                  <p className="text-red-800 font-medium">Ticket verification failed!</p>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  This ticket is invalid or has been tampered with.
                </p>
              </div>

              {/* Scanned Data (for debugging) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Scanned Data</h3>
                <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                  {JSON.stringify(scannedData, null, 2)}
                </pre>
              </div>

              {/* Common Issues */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-3">Possible Issues</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• QR code may be damaged or corrupted</li>
                  <li>• Ticket may have been cancelled</li>
                  <li>• QR code might be a fake or tampered</li>
                  <li>• System data mismatch</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            
            {isValid && onMarkAsUsed && (
              scannedData.backendData?.status === 'COMPLETED' ? (
                <Button
                  variant="secondary"
                  disabled
                  className="bg-gray-400 cursor-not-allowed"
                >
                  Already Completed
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={onMarkAsUsed}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark as Completed
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRVerificationModal;
