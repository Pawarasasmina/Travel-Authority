import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Filter, Bell, Clock, Tag, Mail, Trash2, Check, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import * as notificationApi from '../api/notificationApi';
import { debugLog } from '../utils/debug';

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  iconUrl?: string;
  actionUrl?: string;
  isRead: boolean;
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, currentPage]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      debugLog('NOTIFICATIONS_PAGE', 'Fetching notifications', { userId: user.id, role: user.role, page: currentPage });

      const response = await notificationApi.getUserNotifications(
        user.id,
        user.role,
        currentPage,
        20
      );

      if (response.status === 'OK') {
        setNotifications(response.data || []);
        setTotalPages(response.totalPages || 0);
        debugLog('NOTIFICATIONS_PAGE', 'Notifications loaded', response.data);
      } else {
        setError('Failed to load notifications');
        debugLog('NOTIFICATIONS_PAGE', 'Failed to load notifications', response);
      }
    } catch (err: any) {
      debugLog('NOTIFICATIONS_PAGE', 'Error fetching notifications', err);
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await notificationApi.getUnreadNotificationCount(user.id, user.role);
      if (response.status === 'OK') {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err: any) {
      debugLog('NOTIFICATIONS_PAGE', 'Error fetching unread count', err);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: MessageSquare },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'OFFER', label: 'Offers', icon: Tag },
    { id: 'ALERT', label: 'Alerts', icon: Bell },
  ];

  const filterNotifications = (notifications: NotificationData[]) => {
    return notifications
      .filter(notif => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notif.isRead;
        return notif.type === activeTab;
      })
      .filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'OFFER':
        return 'bg-green-100 text-green-800';
      case 'ALERT':
        return 'bg-red-100 text-red-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'SYSTEM':
        return 'bg-purple-100 text-purple-800';
      case 'BOOKING_CONFIRMATION':
        return 'bg-indigo-100 text-indigo-800';
      case 'PAYMENT_SUCCESS':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = async (id: number) => {
    if (!user) return;

    try {
      await notificationApi.markNotificationAsRead(id, user.id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      fetchUnreadCount();
    } catch (err: any) {
      debugLog('NOTIFICATIONS_PAGE', 'Error marking as read', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationApi.markAllNotificationsAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      debugLog('NOTIFICATIONS_PAGE', 'Error marking all as read', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  const filteredNotifications = filterNotifications(notifications);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Stay updated with your travel activities and offers</p>
          </div>

          {/* Tabs - Horizontal scrollable on mobile */}
          <div className="border-b overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 sm:gap-8 px-4 sm:px-6 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={16} className="sm:size-[18px]" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'unread' && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full">
                      3
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <div className="relative w-full sm:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread</option>
                  <option value="offer">Offers</option>
                  <option value="alert">Alerts</option>
                  <option value="update">Updates</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
              
              <div className="relative flex-1 sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">We'll notify you when something arrives.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 rounded-full ${getTypeStyle(notification.type)} bg-opacity-10 hidden sm:block`}>
                      <Bell size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm sm:text-base truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {!notification.isRead && (
                              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full ml-2"></span>
                            )}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm line-clamp-2">{notification.message}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                              <Clock size={14} />
                              {formatTime(notification.createdAt)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(notification.type)}`}>
                              {notification.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              className="p-2"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Mail size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={markAllAsRead}
                className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Mark All as Read ({unreadCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
