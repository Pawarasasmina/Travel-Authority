import React, { useEffect, useState } from 'react';
import { X, Bell, AlertCircle, Info, CheckCircle, Gift, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationToastProps {
  notification: {
    id: number;
    title: string;
    message: string;
    type: 'OFFER' | 'ALERT' | 'UPDATE' | 'SYSTEM' | 'BOOKING_CONFIRMATION' | 'PAYMENT_SUCCESS';
    actionUrl?: string;
    iconUrl?: string;
    createdAt: string;
  };
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto close after duration
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        navigate(notification.actionUrl);
      }
    }
    markAsRead(notification.id);
    handleClose();
  };

  const handleMarkAsRead = () => {
    markAsRead(notification.id);
    handleClose();
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'OFFER':
        return <Gift className="w-6 h-6 text-green-600" />;
      case 'ALERT':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'UPDATE':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'SYSTEM':
        return <Bell className="w-6 h-6 text-gray-600" />;
      case 'BOOKING_CONFIRMATION':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'PAYMENT_SUCCESS':
        return <CreditCard className="w-6 h-6 text-green-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTypeColors = () => {
    switch (notification.type) {
      case 'OFFER':
        return 'border-green-200 bg-green-50';
      case 'ALERT':
        return 'border-red-200 bg-red-50';
      case 'UPDATE':
        return 'border-blue-200 bg-blue-50';
      case 'SYSTEM':
        return 'border-gray-200 bg-gray-50';
      case 'BOOKING_CONFIRMATION':
        return 'border-green-200 bg-green-50';
      case 'PAYMENT_SUCCESS':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          w-96 max-w-sm mx-auto bg-white border-l-4 ${getTypeColors()} 
          rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              {notification.iconUrl ? (
                <img 
                  src={notification.iconUrl} 
                  alt="Notification icon" 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                getTypeIcon()
              )}
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                {notification.title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {notification.message}
          </p>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleTimeString()}
            </span>
            
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAsRead}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
              
              {notification.actionUrl && (
                <button
                  onClick={handleAction}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all ease-linear animate-shrink"
              style={{
                animationDuration: `${duration}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
