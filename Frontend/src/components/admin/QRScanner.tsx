import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera, CameraOff, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { verifyQRCode } from '../../api/adminApi';
import { verifyOwnerQRCode } from '../../api/ownerApi';
import { debugLog } from '../../utils/debug';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
  expectedBookingId?: string;
  mode?: 'admin' | 'owner'; // Add mode prop to determine which API to use
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  expectedBookingId,
  mode = 'admin' // Default to admin mode for backward compatibility
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initScanner();
    }
    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, [isOpen]);

  const initScanner = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      
      // Check camera permissions
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permissionStatus.state === 'granted');

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Scanner callback received result:', result);
          if (result && result.data) {
            console.log('QR Scanner result data:', result.data);
            handleScan(result.data);
          } else {
            console.warn('QR Scanner result is null or empty:', result);
            setError('QR code scan failed: Invalid or empty QR code data');
          }
        },
        {
          onDecodeError: (err) => {
            // Ignore decode errors as they're common when no QR code is visible
            console.debug('QR Decode error:', err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera if available
        }
      );

      setQrScanner(scanner);
      await scanner.start();
      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      // Provide more specific error message
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please grant camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure a camera is connected.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is in use by another application. Please close other apps and try again.');
      } else {
        setError('Failed to access camera: ' + (err.message || 'Unknown error'));
      }
      setHasPermission(false);
    }
  };

  const handleScan = async (data: string) => {
    if (isValidating) return; // Prevent multiple scans

    try {
      setIsValidating(true);
      debugLog('QR_SCANNER', 'QR code scanned', data);
      
      // Check if data is null or empty
      if (!data || data.trim() === '') {
        throw new Error('QR code data is empty');
      }
      
      // Try to parse the QR code data
      let scannedData;
      try {
        scannedData = JSON.parse(data);
      } catch (parseError) {
        throw new Error('Invalid QR code format - not valid JSON');
      }

      setScanResult(scannedData);

      // Validate the QR code data structure
      if (!scannedData.ticketId || !scannedData.verificationCode) {
        throw new Error('Invalid QR code format - missing required fields');
      }

      // If we're expecting a specific booking ID, validate it
      if (expectedBookingId && scannedData.ticketId !== expectedBookingId) {
        throw new Error('QR code does not match expected booking');
      }

      // Verify with backend using the appropriate API
      debugLog('QR_SCANNER', 'Verifying QR code with backend', { mode });
      const verificationResponse = mode === 'owner' 
        ? await verifyOwnerQRCode(data)
        : await verifyQRCode(data);
      
      // Check if verification was successful
      if (!verificationResponse.success) {
        throw new Error(verificationResponse.message || 'Backend verification failed');
      }

      debugLog('QR_SCANNER', 'QR code verification successful', verificationResponse.data);
      
      // Success - pass the validated data along with backend response
      onScanSuccess({
        ...scannedData,
        backendData: verificationResponse.data
      });
      
    } catch (err: any) {
      console.error('QR Scan validation error:', err);
      debugLog('QR_SCANNER', 'QR scan validation error', err);
      setError(err.message || 'Invalid QR code');
      setScanResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    if (qrScanner) {
      qrScanner.stop();
    }
    setScanResult(null);
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setScanResult(null);
    if (qrScanner) {
      qrScanner.start();
    } else {
      initScanner();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Video Scanner */}
          <div className="relative mb-4">
            <video
              ref={videoRef}
              className="w-full aspect-square object-cover rounded-lg bg-gray-100"
              playsInline
              muted
            />
            
            {/* Overlay Messages */}
            {!hasPermission && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                <div className="text-center text-white p-4">
                  <CameraOff size={48} className="mx-auto mb-2" />
                  <p>Camera access required</p>
                  <p className="text-sm opacity-75">Please grant camera permissions and try again</p>
                </div>
              </div>
            )}

            {isValidating && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-75 rounded-lg">
                <div className="text-center text-white p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Validating QR Code...</p>
                </div>
              </div>
            )}

            {/* Scanning indicator */}
            {isScanning && !error && !scanResult && (
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Camera size={16} className="mr-2" />
                  Scanning for QR codes...
                </div>
              </div>
            )}
          </div>

          {/* Expected booking info */}
          {expectedBookingId && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Expected Booking:</strong> {expectedBookingId}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                The QR code must match this booking ID
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-red-600 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Scan Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {scanResult && !error && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle size={20} className="text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Valid QR Code Detected!</p>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Booking ID:</strong> {scanResult.ticketId}</p>
                <p><strong>Event:</strong> {scanResult.eventTitle}</p>
                <p><strong>Date:</strong> {new Date(scanResult.date).toLocaleDateString()}</p>
                <p><strong>Persons:</strong> {scanResult.persons}</p>
                <p><strong>Status:</strong> {scanResult.status}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 text-center mb-4">
            {hasPermission === false ? (
              <p>Please allow camera access to scan QR codes</p>
            ) : (
              <p>Position the QR code within the camera frame</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {error && (
              <Button
                variant="primary"
                onClick={handleRetry}
                className="flex-1"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
