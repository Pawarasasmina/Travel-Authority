import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as notificationApi from '../api/notificationApi';
import { debugLog } from '../utils/debug';

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

interface NotificationContextType {
  unreadCount: number;
  newNotification: NotificationData | null;
  notifications: NotificationData[];
  refreshNotifications: () => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  dismissNewNotification: () => void;
  checkForNewNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [newNotification, setNewNotification] = useState<NotificationData | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Track last shown notification ID in localStorage
  const getLastShownNotificationId = () => {
    const id = localStorage.getItem('lastShownNotificationId');
    return id ? parseInt(id, 10) : null;
  };
  const setLastShownNotificationId = (id: number) => {
    localStorage.setItem('lastShownNotificationId', id.toString());
  };

  // Fetch initial data when user is available
  useEffect(() => {
    if (user) {
      refreshNotifications();
      fetchUnreadCount();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        checkForNewNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const refreshNotifications = async () => {
    if (!user) return;

    try {
      debugLog('NOTIFICATION_CONTEXT', 'Refreshing notifications for user', { 
        userId: user.id, 
        userRole: user.role 
      });

      const response = await notificationApi.getUserNotifications(
        user.id,
        user.role,
        0,
        20
      );

      if (response.status === 'OK' && response.data) {
        setNotifications(response.data);
        debugLog('NOTIFICATION_CONTEXT', 'Notifications refreshed', { count: response.data.length });
      }
    } catch (error) {
      debugLog('NOTIFICATION_CONTEXT', 'Error refreshing notifications', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      debugLog('NOTIFICATION_CONTEXT', 'Fetching unread count', { 
        userId: user.id, 
        userRole: user.role 
      });

      const response = await notificationApi.getUnreadNotificationCount(user.id, user.role);
      
      if (response.status === 'OK') {
        setUnreadCount(response.unreadCount);
        debugLog('NOTIFICATION_CONTEXT', 'Unread count updated', { count: response.unreadCount });
      }
    } catch (error) {
      debugLog('NOTIFICATION_CONTEXT', 'Error fetching unread count', error);
    }
  };

  const checkForNewNotifications = async () => {
    if (!user) return;

    try {
      debugLog('NOTIFICATION_CONTEXT', 'Checking for new notifications since', lastChecked);

      const response = await notificationApi.getUserNotifications(
        user.id,
        user.role,
        0,
        5 // Just check the latest 5
      );

      if (response.status === 'OK' && response.data) {
        // Only show popup for the latest notification if it's new
        const lastShownId = getLastShownNotificationId();
        const sorted = [...response.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = sorted[0];
        if (latest && latest.id !== lastShownId) {
          debugLog('NOTIFICATION_CONTEXT', 'Found new notification for popup', { id: latest.id });
          setNewNotification(latest);
          // Don't update lastShownNotificationId here; update when dismissed
          refreshNotifications();
          fetchUnreadCount();
        }
        setLastChecked(new Date());
      }
    } catch (error) {
      debugLog('NOTIFICATION_CONTEXT', 'Error checking for new notifications', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!user) return;

    try {
      debugLog('NOTIFICATION_CONTEXT', 'Marking notification as read', { notificationId });

      await notificationApi.markNotificationAsRead(notificationId, user.id);

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      fetchUnreadCount();

      debugLog('NOTIFICATION_CONTEXT', 'Notification marked as read successfully');
    } catch (error) {
      debugLog('NOTIFICATION_CONTEXT', 'Error marking notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      debugLog('NOTIFICATION_CONTEXT', 'Marking all notifications as read');

      await notificationApi.markAllNotificationsAsRead(user.id);

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      setUnreadCount(0);

      debugLog('NOTIFICATION_CONTEXT', 'All notifications marked as read successfully');
    } catch (error) {
      debugLog('NOTIFICATION_CONTEXT', 'Error marking all notifications as read', error);
    }
  };

  const dismissNewNotification = () => {
    if (newNotification) {
      setLastShownNotificationId(newNotification.id);
    }
    setNewNotification(null);
  };

  const value: NotificationContextType = {
    unreadCount,
    newNotification,
    notifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    dismissNewNotification,
    checkForNewNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
