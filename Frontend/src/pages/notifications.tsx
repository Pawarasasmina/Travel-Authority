import React, { useState } from 'react';
import { ChevronDown, Search, Filter, Bell, Clock, Tag, Mail, Trash2, Check, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';

interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'offer' | 'alert' | 'update';
  isRead: boolean;
  icon: React.ElementType;
}

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const notifications: Notification[] = [
    {
      id: 1,
      title: "Special Summer Offer",
      description: "Get 20% off on all beach activities this summer! Limited time offer.",
      date: "2024-02-20",
      time: "09:30 AM",
      type: "offer",
      isRead: false,
      icon: Tag
    },
    {
      id: 2,
      title: "Booking Confirmation",
      description: "Your booking for Sigiriya Rock Fortress has been confirmed.",
      date: "2024-02-20",
      time: "10:15 AM",
      type: "update",
      isRead: true,
      icon: Check
    },
    {
      id: 3,
      title: "Weather Alert",
      description: "Weather warning for Southern coastal areas. Please check your booking.",
      date: "2024-02-19",
      time: "03:45 PM",
      type: "alert",
      isRead: false,
      icon: Bell
    }
  ];

  const tabs = [
    { id: 'all', label: 'All', icon: MessageSquare },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  const filterNotifications = (notifications: Notification[]) => {
    return notifications
      .filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.isRead;
        return notif.type === filter;
      })
      .filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = (id: number) => {
    // Implement mark as read functionality
  };

  const deleteNotification = (id: number) => {
    // Implement delete functionality
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-600 mt-2">Stay updated with your travel activities and offers</p>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.id === 'unread' && (
                    <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      3
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread</option>
                    <option value="offer">Offers</option>
                    <option value="alert">Alerts</option>
                    <option value="update">Updates</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
                
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">We'll notify you when something arrives.</p>
              </div>
            ) : (
              filterNotifications(notifications).map((notification) => (
                <div
                  key={notification.id}
                  className={`group p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getTypeStyle(notification.type)} bg-opacity-10`}>
                      <notification.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock size={14} />
                              {notification.date} at {notification.time}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(notification.type)}`}>
                              {notification.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              className="p-2"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Mail size={16} />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="p-2 text-red-600 hover:bg-red-50"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
