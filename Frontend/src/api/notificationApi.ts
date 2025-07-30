import api from './axiosConfig';
import { debugLog } from '../utils/debug';

export interface NotificationDTO {
  id: number;
  title: string;
  description: string;
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

export interface CreateNotificationDTO {
  title: string;
  description: string;
  message: string;
  type: 'OFFER' | 'ALERT' | 'UPDATE' | 'SYSTEM' | 'BOOKING_CONFIRMATION' | 'PAYMENT_SUCCESS';
  targetUserType: 'ALL_USERS' | 'NORMAL_USERS' | 'ACTIVITY_OWNERS' | 'SPECIFIC_USER';
  targetUserId?: number;
  expiresAt?: string;
  actionUrl?: string;
  iconUrl?: string;
}

export interface NotificationResponse {
  status: string;
  data: NotificationDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface UnreadCountResponse {
  status: string;
  unreadCount: number;
}

// Get user notifications with pagination
export const getUserNotifications = async (
  userId: number,
  userRole: string,
  page: number = 0,
  size: number = 20
): Promise<NotificationResponse> => {
  try {
    debugLog('NOTIFICATION_API', 'Fetching user notifications', { userId, userRole, page, size });
    
    const response = await api.get('/notifications/my-notifications', {
      params: { userId, userRole, page, size }
    });
    
    debugLog('NOTIFICATION_API', 'User notifications response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error fetching user notifications', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (
  userId: number,
  userRole: string
): Promise<UnreadCountResponse> => {
  try {
    debugLog('NOTIFICATION_API', 'Fetching unread count', { userId, userRole });
    
    const response = await api.get('/notifications/unread-count', {
      params: { userId, userRole }
    });
    
    debugLog('NOTIFICATION_API', 'Unread count response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error fetching unread count', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: number,
  userId: number
): Promise<{ status: string; message: string }> => {
  try {
    debugLog('NOTIFICATION_API', 'Marking notification as read', { notificationId, userId });
    
    const response = await api.put(`/api/notifications/${notificationId}/read`, null, {
      params: { userId }
    });
    
    debugLog('NOTIFICATION_API', 'Mark as read response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error marking notification as read', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  userId: number
): Promise<{ status: string; message: string }> => {
  try {
    debugLog('NOTIFICATION_API', 'Marking all notifications as read', { userId });
    
    const response = await api.put('/api/notifications/mark-all-read', null, {
      params: { userId }
    });
    
    debugLog('NOTIFICATION_API', 'Mark all as read response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error marking all notifications as read', error);
    throw error;
  }
};

// Admin: Create notification
export const createNotification = async (
  notificationData: CreateNotificationDTO
): Promise<{ status: string; message: string; data: NotificationDTO }> => {
  try {
    debugLog('NOTIFICATION_API', 'Creating notification', notificationData);
    
    const response = await api.post('/admin/notifications', notificationData);
    
    debugLog('NOTIFICATION_API', 'Create notification response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error creating notification', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Admin: Get all notifications
export const getAllNotificationsForAdmin = async (
  page: number = 0,
  size: number = 20
): Promise<{ status: string; message: string; data: { notifications: NotificationDTO[]; totalElements: number; totalPages: number; currentPage: number } }> => {
  try {
    debugLog('NOTIFICATION_API', 'Fetching all notifications for admin', { page, size });
    
    const response = await api.get('/admin/notifications', {
      params: { page, size }
    });
    
    debugLog('NOTIFICATION_API', 'Admin notifications response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error fetching admin notifications', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Admin: Update notification
export const updateNotification = async (
  notificationId: number,
  notificationData: CreateNotificationDTO
): Promise<{ status: string; message: string; data: NotificationDTO }> => {
  try {
    debugLog('NOTIFICATION_API', 'Updating notification', { notificationId, notificationData });
    
    const response = await api.put(`/admin/notifications/${notificationId}`, notificationData);
    
    debugLog('NOTIFICATION_API', 'Update notification response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error updating notification', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Admin: Delete notification
export const deleteNotification = async (
  notificationId: number
): Promise<{ status: string; message: string }> => {
  try {
    debugLog('NOTIFICATION_API', 'Deleting notification', { notificationId });
    
    const response = await api.delete(`/admin/notifications/${notificationId}`);
    
    debugLog('NOTIFICATION_API', 'Delete notification response', response.data);
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error deleting notification', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Get notification types
export const getNotificationTypes = async (): Promise<{ status: string; data: string[] }> => {
  try {
    const response = await api.get('/admin/notifications/types');
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error fetching notification types', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Get target user types
export const getTargetUserTypes = async (): Promise<{ status: string; data: string[] }> => {
  try {
    const response = await api.get('/admin/notifications/target-types');
    return response.data;
  } catch (error: any) {
    debugLog('NOTIFICATION_API', 'Error fetching target user types', error);
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};
