import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";
import { debugLog } from "../utils/debug";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: 'OFFER' | 'ALERT' | 'UPDATE' | 'SYSTEM' | 'BOOKING_CONFIRMATION' | 'PAYMENT_SUCCESS';
  targetUserType: 'ALL_USERS' | 'NORMAL_USERS' | 'ACTIVITY_OWNERS' | 'SPECIFIC_USER';
  targetUserId?: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  actionUrl?: string;
  iconUrl?: string;
  createdByName: string;
  isRead: boolean;
}

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleNotificationClick = async (notification: NotificationData) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        debugLog('NOTIFICATION_MODAL', 'Notification marked as read', { id: notification.id });
      } catch (err) {
        debugLog('NOTIFICATION_MODAL', 'Error marking notification as read', err);
      }
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      onClose();
      navigate(notification.actionUrl);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const groupNotificationsByDate = (notifications: NotificationData[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayNotifications = notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      return notificationDate.toDateString() === today.toDateString();
    });

    const yesterdayNotifications = notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      return notificationDate.toDateString() === yesterday.toDateString();
    });

    const olderNotifications = notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      return notificationDate.toDateString() !== today.toDateString() && 
             notificationDate.toDateString() !== yesterday.toDateString();
    });

    return { todayNotifications, yesterdayNotifications, olderNotifications };
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const { todayNotifications, yesterdayNotifications, olderNotifications } = groupNotificationsByDate(notifications);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackdropClick}
      />
      
      <div className="fixed md:absolute top-0 md:top-12 right-0 w-full md:w-[350px] h-full md:h-auto bg-white md:rounded-lg shadow-xl overflow-hidden z-50">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 md:p-3 border-b flex justify-between items-center bg-white">
          <h3 className="font-semibold text-gray-800 text-lg md:text-base">Notifications</h3>
          <button onClick={onClose} className="p-2 md:p-0 hover:bg-gray-100 md:hover:bg-transparent rounded-full md:rounded-none">
            <X size={20} className="md:size-[18px]" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-60px)] md:max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <>
              {/* Today's notifications */}
              {todayNotifications.length > 0 && (
                <div className="p-4 md:p-3 border-b">
                  <h4 className="text-orange-400 font-semibold mb-3 md:mb-2 text-sm">Today</h4>
                  <div className="space-y-4 md:space-y-3">
                    {todayNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex gap-4 md:gap-3 cursor-pointer hover:bg-gray-50 p-3 md:p-2 rounded-lg md:rounded ${!notification.isRead ? 'bg-orange-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded bg-orange-100 flex items-center justify-center">
                          {notification.iconUrl ? (
                            <img 
                              src={notification.iconUrl} 
                              alt={notification.title} 
                              className="w-full h-full rounded-lg md:rounded object-cover"
                            />
                          ) : (
                            <span className="text-orange-600 font-semibold text-sm">
                              {notification.type.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h5 className={`font-medium text-base md:text-sm truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h5>
                            <span className="text-gray-400 text-sm md:text-xs whitespace-nowrap ml-2">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm md:text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday's notifications */}
              {yesterdayNotifications.length > 0 && (
                <div className="p-4 md:p-3 border-b">
                  <h4 className="text-orange-400 font-semibold mb-3 md:mb-2 text-sm">Yesterday</h4>
                  <div className="space-y-4 md:space-y-3">
                    {yesterdayNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex gap-4 md:gap-3 cursor-pointer hover:bg-gray-50 p-3 md:p-2 rounded-lg md:rounded ${!notification.isRead ? 'bg-orange-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded bg-orange-100 flex items-center justify-center">
                          {notification.iconUrl ? (
                            <img 
                              src={notification.iconUrl} 
                              alt={notification.title} 
                              className="w-full h-full rounded-lg md:rounded object-cover"
                            />
                          ) : (
                            <span className="text-orange-600 font-semibold text-sm">
                              {notification.type.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h5 className={`font-medium text-base md:text-sm truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h5>
                            <span className="text-gray-400 text-sm md:text-xs whitespace-nowrap ml-2">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm md:text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Older notifications */}
              {olderNotifications.length > 0 && (
                <div className="p-4 md:p-3 border-b">
                  <h4 className="text-orange-400 font-semibold mb-3 md:mb-2 text-sm">Earlier</h4>
                  <div className="space-y-4 md:space-y-3">
                    {olderNotifications.slice(0, 3).map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex gap-4 md:gap-3 cursor-pointer hover:bg-gray-50 p-3 md:p-2 rounded-lg md:rounded ${!notification.isRead ? 'bg-orange-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded bg-orange-100 flex items-center justify-center">
                          {notification.iconUrl ? (
                            <img 
                              src={notification.iconUrl} 
                              alt={notification.title} 
                              className="w-full h-full rounded-lg md:rounded object-cover"
                            />
                          ) : (
                            <span className="text-orange-600 font-semibold text-sm">
                              {notification.type.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h5 className={`font-medium text-base md:text-sm truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h5>
                            <span className="text-gray-400 text-sm md:text-xs whitespace-nowrap ml-2">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm md:text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* View all button */}
          <div className="sticky bottom-0 p-4 md:p-3 bg-white border-t">
            <button 
              onClick={handleViewAll}
              className="w-full py-3 md:py-2 bg-orange-50 text-orange-500 rounded-lg font-medium hover:bg-orange-100 transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
