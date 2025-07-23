import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Plus, Search, Trash2, Edit, Eye, X, Check } from 'lucide-react';
import * as adminApi from '../../api/adminApi';
import { debugLog } from '../../utils/debug';
import { Activity } from '../../types';
import ActivityForm from './ActivityForm';

interface AdminActivity extends Activity {
  bookings?: number;
  revenue?: number;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

const ActivityManagement: React.FC = () => {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<AdminActivity | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [refreshKey]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      debugLog('ADMIN_ACTIVITIES', 'Fetching admin activities');

      const response = await adminApi.getAdminActivities();
      if (response.status === 'OK' || response.status === '200 OK') {
        const activitiesData = response.data || [];
        setActivities(activitiesData);
        debugLog('ADMIN_ACTIVITIES', 'Activities loaded', activitiesData);
      } else {
        debugLog('ADMIN_ACTIVITIES', 'Failed to get activities', response);
        setError('Failed to load activities: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_ACTIVITIES', 'Error fetching activities', err);
      setError('Error loading activities: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    return (
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddNew = () => {
    setCurrentActivity(null);
    setShowForm(true);
  };

  const handleEdit = (activity: AdminActivity) => {
    setCurrentActivity(activity);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setCurrentActivity(null);
  };

  const handleDelete = async (activity: AdminActivity) => {
    if (!activity.id) {
      alert('Cannot delete activity: Missing ID');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      return;
    }
    
    try {
      setDeleteInProgress(activity.id.toString());
      const response = await adminApi.deleteActivity(activity.id as number);
      
      if (response.status === 'OK' || response.status === '200 OK' || response.status === 'NO_CONTENT') {
        debugLog('ADMIN_ACTIVITIES', 'Activity deleted successfully', response);
        // Refresh the activities list
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        debugLog('ADMIN_ACTIVITIES', 'Failed to delete activity', response);
        alert('Failed to delete activity: ' + response.message);
      }
    } catch (err: any) {
      debugLog('ADMIN_ACTIVITIES', 'Error deleting activity', err);
      alert('Error deleting activity: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleteInProgress(null);
    }
  };

  const handleFormSubmit = async (activityData: Activity) => {
    try {
      // Show a loading indicator or disable form submission to prevent multiple submissions
      setLoading(true);
      debugLog('ADMIN_ACTIVITIES', 'Saving activity data', activityData);
      
      debugLog('ADMIN_ACTIVITIES', 'Processing save activity request', { 
        id: activityData.id, 
        title: activityData.title,
        packages: activityData.packages?.length || 0
      });
      
      const response = await adminApi.saveActivity(activityData);
      
      debugLog('ADMIN_ACTIVITIES', 'Response status:', response.status);
      
      if (response.status === 'OK' || response.status === '200 OK' || response.status === 'CREATED' || 
          response.status === '201 CREATED' || response.success === true) {
        debugLog('ADMIN_ACTIVITIES', 'Activity saved successfully', response.data);
        setShowForm(false);
        // Set success message in the UI
        setSuccessMessage(`Activity "${activityData.title}" saved successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setRefreshKey(prevKey => prevKey + 1); // Trigger re-fetch
      } else {
        debugLog('ADMIN_ACTIVITIES', 'Failed to save activity', response);
        setError('Failed to save activity: ' + (response.message || 'Server returned an error'));
        setTimeout(() => setError(null), 5000);
        alert('Failed to save activity: ' + (response.message || 'Server returned an error'));
      }
    } catch (err: any) {
      debugLog('ADMIN_ACTIVITIES', 'Error saving activity', err);
      alert('Error saving activity: ' + (err.message || 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = () => {
    if (activities.length === 0) {
      alert('No activities to delete');
      return;
    }
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setIsDeleting(true);
      debugLog('ADMIN_ACTIVITIES', 'Deleting all activities');
      
      const response = await adminApi.deleteAllActivities();
      
      if (response.status === 'OK' || response.status === '200 OK') {
        debugLog('ADMIN_ACTIVITIES', 'All activities deleted successfully', response);
        setSuccessMessage('All activities have been deleted successfully');
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Refresh the activities list
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        throw new Error(response.message || 'Failed to delete all activities');
      }
    } catch (err: any) {
      console.error('Error deleting all activities:', err);
      setError('Failed to delete all activities: ' + (err.message || 'Unknown error'));
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
      setShowDeleteAllConfirm(false);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {showForm ? (
            <ActivityForm 
              activity={currentActivity} 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormClose} 
            />
          ) : (
            <>
              {/* Header Section */}
              <div className="bg-black px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ActivityIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Activity Management</h1>
                      <p className="text-gray-300">Manage and organize your travel activities</p>
                    </div>
                  </div>
                  <div className="text-white text-right">
                    <div className="text-3xl font-bold">{activities.length}</div>
                    <div className="text-sm text-gray-300">Total Activities</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Action Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search activities by title or location..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddNew}
                      className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus size={20} className="mr-2" />
                      Add New Activity
                    </button>
                    
                    {activities.length > 0 && (
                      <button
                        onClick={handleDeleteAll}
                        className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        disabled={isDeleting}
                      >
                        <Trash2 size={20} className="mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete All'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    {successMessage}
                  </div>
                )}
                
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center">
                    <X className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                )}

                {/* Activities Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Activity
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Availability
                          </th>
                         
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredActivities.length > 0 ? (
                          filteredActivities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-12 w-12 flex-shrink-0">
                                    <img
                                      className="h-12 w-12 rounded-lg object-cover border-2 border-gray-200"
                                      src={activity.image || 'https://via.placeholder.com/100'}
                                      alt={activity.title}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {activity.title}
                                    </div>
                                   {/*} <div className="text-sm text-gray-500">
                                      {typeof activity.createdBy === 'string' && activity.createdBy 
                                        ? `Added by ${activity.createdBy}` 
                                        : activity.createdBy?.name 
                                          ? `Added by ${activity.createdBy.name}` 
                                          : 'Unknown creator'}
                                    </div> */}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">{activity.location}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-700">Rs. {activity.price}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">{activity.availability}</div>
                              </td>
                              
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                                    activity.active
                                      ? "bg-gray-100 text-gray-800 border border-gray-300"
                                      : "bg-gray-200 text-gray-600 border border-gray-400"
                                  }`}
                                >
                                  {activity.active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                    title="View Activity"
                                    onClick={() => window.open(`/activities/${activity.id}`, '_blank')}
                                  >
                                    <Eye size={18} />
                                  </button>
                                  <button
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                    title="Edit Activity"
                                    onClick={() => handleEdit(activity)}
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                    title="Delete Activity"
                                    onClick={() => handleDelete(activity)}
                                    disabled={activity.id !== undefined && deleteInProgress === activity.id.toString()}
                                  >                            
                                    {deleteInProgress === (activity.id ?? '').toString() ? (
                                      <ActivityIcon className="animate-spin h-5 w-5" />
                                    ) : (
                                      <Trash2 size={18} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <ActivityIcon className="w-12 h-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                                <p className="text-gray-500">
                                  {searchTerm
                                    ? "No activities match your search criteria"
                                    : "Get started by creating your first activity"}
                                </p>
                                {!searchTerm && (
                                  <button
                                    onClick={handleAddNew}
                                    className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                                  >
                                    Create Activity
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

                {/* Delete All Confirmation Modal */}
                {showDeleteAllConfirm && (
                  <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setShowDeleteAllConfirm(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-3 bg-gray-100 rounded-full mr-4">
                              <Trash2 className="w-6 h-6 text-gray-800" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900">Confirm Deletion</h4>
                          </div>
                          <p className="text-gray-700 mb-6">
                            Are you sure you want to delete all <span className="font-bold text-black">{activities.length}</span> activities? This action cannot be undone and will permanently remove all activity data.
                          </p>
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setShowDeleteAllConfirm(false)}
                              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmDeleteAll}
                              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete All Activities'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityManagement;
