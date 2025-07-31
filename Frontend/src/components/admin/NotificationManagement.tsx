import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  Users, 
  UserCheck,
  Target,
  Search,
  Calendar,
  AlertCircle,
  Mail,
  Settings,
  Send
} from 'lucide-react';
import * as notificationApi from '../../api/notificationApi';
import { debugLog } from '../../utils/debug';

interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  type: string;
  targetUserType: string;
  targetUserId?: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  actionUrl?: string;
  iconUrl?: string;
  createdByName: string;
  isRead?: boolean;
}

interface CreateNotificationDTO {
  title: string;
  message: string;
  type: 'OFFER' | 'ALERT' | 'UPDATE' | 'SYSTEM' | 'BOOKING_CONFIRMATION' | 'PAYMENT_SUCCESS';
  targetUserType: 'ALL_USERS' | 'NORMAL_USERS' | 'ACTIVITY_OWNERS' | 'SPECIFIC_USER';
  targetUserId?: number;
  expiresAt?: string;
  actionUrl?: string;
  iconUrl?: string;
}

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTargetType, setFilterTargetType] = useState('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDTO | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateNotificationDTO>({
    title: '',
    message: '',
    type: 'SYSTEM',
    targetUserType: 'ALL_USERS',
    targetUserId: undefined,
    expiresAt: '',
    actionUrl: '',
    iconUrl: ''
  });

  // Options
  const [notificationTypes, setNotificationTypes] = useState<string[]>([]);
  const [targetUserTypes, setTargetUserTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchOptions();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      debugLog('ADMIN_NOTIFICATIONS', 'Fetching notifications', { page: currentPage });

      const response = await notificationApi.getAllNotificationsForAdmin(currentPage, 20);
      
      if (response.status === 'OK') {
        const data = response.data;
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        debugLog('ADMIN_NOTIFICATIONS', 'Notifications loaded', data);
      } else {
        setError('Failed to load notifications: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_NOTIFICATIONS', 'Error fetching notifications', err);
      setError('Error loading notifications: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [typesResponse, targetTypesResponse] = await Promise.all([
        notificationApi.getNotificationTypes(),
        notificationApi.getTargetUserTypes()
      ]);

      if (typesResponse.status === 'OK') {
        setNotificationTypes(typesResponse.data || []);
      }
      if (targetTypesResponse.status === 'OK') {
        setTargetUserTypes(targetTypesResponse.data || []);
      }
    } catch (err: any) {
      debugLog('ADMIN_NOTIFICATIONS', 'Error fetching options', err);
    }
  };

  const handleCreateNotification = async () => {
    try {
      debugLog('ADMIN_NOTIFICATIONS', 'Creating notification', formData);

      const response = await notificationApi.createNotification(formData);
      
      if (response.status === 'OK' || response.status === 'CREATED') {
        setSuccessMessage('Notification created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchNotifications();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Failed to create notification: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_NOTIFICATIONS', 'Error creating notification', err);
      setError('Error creating notification: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification) return;

    try {
      debugLog('ADMIN_NOTIFICATIONS', 'Updating notification', { id: selectedNotification.id, formData });

      const response = await notificationApi.updateNotification(selectedNotification.id, formData);
      
      if (response.status === 'OK') {
        setSuccessMessage('Notification updated successfully');
        setShowEditModal(false);
        setSelectedNotification(null);
        resetForm();
        fetchNotifications();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Failed to update notification: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_NOTIFICATIONS', 'Error updating notification', err);
      setError('Error updating notification: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      debugLog('ADMIN_NOTIFICATIONS', 'Deleting notification', selectedNotification.id);

      const response = await notificationApi.deleteNotification(selectedNotification.id);
      
      if (response.status === 'OK') {
        setSuccessMessage('Notification deleted successfully');
        setShowDeleteConfirm(false);
        setSelectedNotification(null);
        fetchNotifications();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Failed to delete notification: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_NOTIFICATIONS', 'Error deleting notification', err);
      setError('Error deleting notification: ' + (err.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'SYSTEM',
      targetUserType: 'ALL_USERS',
      targetUserId: undefined,
      expiresAt: '',
      actionUrl: '',
      iconUrl: ''
    });
  };

  const handleEdit = (notification: NotificationDTO) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type as any,
      targetUserType: notification.targetUserType as any,
      targetUserId: notification.targetUserId,
      expiresAt: notification.expiresAt ? notification.expiresAt.substring(0, 16) : '',
      actionUrl: notification.actionUrl || '',
      iconUrl: notification.iconUrl || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (notification: NotificationDTO) => {
    setSelectedNotification(notification);
    setShowDeleteConfirm(true);
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'OFFER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ALERT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SYSTEM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BOOKING_CONFIRMATION':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PAYMENT_SUCCESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case 'ALL_USERS':
        return <Users size={16} />;
      case 'NORMAL_USERS':
        return <UserCheck size={16} />;
      case 'ACTIVITY_OWNERS':
        return <Settings size={16} />;
      case 'SPECIFIC_USER':
        return <Target size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OFFER':
        return <Target size={16} />;
      case 'ALERT':
        return <AlertCircle size={16} />;
      case 'UPDATE':
        return <Settings size={16} />;
      case 'SYSTEM':
        return <Bell size={16} />;
      case 'BOOKING_CONFIRMATION':
        return <Check size={16} />;
      case 'PAYMENT_SUCCESS':
        return <Check size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesTargetType = filterTargetType === 'all' || notification.targetUserType === filterTargetType;
    
    return matchesSearch && matchesType && matchesTargetType;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-white/20 rounded-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Notification Management</h1>
                  <p className="text-gray-300">Manage system notifications and announcements</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Notification</span>
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between shadow-sm">
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

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between shadow-sm">
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

          {/* Filters */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>

              <select
                value={filterTargetType}
                onChange={(e) => setFilterTargetType(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Target Types</option>
                {targetUserTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {totalElements} total notifications
                </span>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">Create your first notification to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${getTypeStyle(notification.type)} flex items-center gap-2`}>
                            {getTypeIcon(notification.type)}
                            <span className="text-sm font-medium">{notification.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                            {getTargetTypeIcon(notification.targetUserType)}
                            <span className="text-sm text-gray-700">{notification.targetUserType.replace('_', ' ')}</span>
                          </div>
                          {!notification.isActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{notification.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{notification.message}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                          </div>
                          {notification.expiresAt && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Expires: {new Date(notification.expiresAt).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>By: {notification.createdByName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(notification)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit notification"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(notification)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-semibold">
                  {showCreateModal ? 'Create New Notification' : 'Edit Notification'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Enter notification title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {notificationTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter notification message"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Users *</label>
                    <select
                      value={formData.targetUserType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        targetUserType: e.target.value as any,
                        targetUserId: e.target.value === 'SPECIFIC_USER' ? prev.targetUserId : undefined
                      }))}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {targetUserTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {formData.targetUserType === 'SPECIFIC_USER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target User ID *</label>
                      <input
                        type="number"
                        value={formData.targetUserId || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetUserId: e.target.value ? parseInt(e.target.value) : undefined }))}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Enter user ID"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
                    <input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action URL</label>
                    <input
                      type="url"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="https://example.com/action"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL</label>
                  <input
                    type="url"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showCreateModal ? handleCreateNotification : handleUpdateNotification}
                  disabled={!formData.title || !formData.message}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} />
                  {showCreateModal ? 'Create Notification' : 'Update Notification'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedNotification && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h3 className="text-lg font-semibold text-red-600">Delete Notification</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Are you sure?</h4>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1"><strong>Title:</strong> {selectedNotification.title}</p>
                  <p className="text-sm text-gray-600"><strong>Type:</strong> {selectedNotification.type}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteNotification}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Notification
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationManagement;
