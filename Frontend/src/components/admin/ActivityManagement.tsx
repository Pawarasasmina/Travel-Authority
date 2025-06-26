import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, MoreVertical, Plus, Search, Trash2, Edit, Eye, X } from 'lucide-react';
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
      
      const response = await adminApi.saveActivity(activityData);
      if (response.status === 'OK' || response.status === '200 OK' || response.status === 'CREATED') {
        debugLog('ADMIN_ACTIVITIES', 'Activity saved successfully', response.data);
        setShowForm(false);
        setRefreshKey(prevKey => prevKey + 1); // Trigger re-fetch
        // Show success message
        alert('Activity saved successfully!');
      } else {
        debugLog('ADMIN_ACTIVITIES', 'Failed to save activity', response);
        alert('Failed to save activity: ' + (response.message || 'Server returned an error'));
      }
    } catch (err: any) {
      debugLog('ADMIN_ACTIVITIES', 'Error saving activity', err);
      alert('Error saving activity: ' + (err.message || 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {showForm ? (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {currentActivity ? 'Edit Activity' : 'Add New Activity'}
            </h2>
            <button
              onClick={handleFormClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          <ActivityForm 
            activity={currentActivity} 
            onSubmit={handleFormSubmit} 
            onCancel={handleFormClose} 
          />
        </div>
      ) : (
        <>
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold">Manage Activities</h2>

              <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-grow md:w-64">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                <button
                  onClick={handleAddNew}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} className="mr-1" />
                  Add New
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={activity.image || 'https://via.placeholder.com/100'}
                              alt={activity.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.createdBy ? `Added by ${activity.createdBy.name}` : 'Unknown creator'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {activity.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.availability}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {activity.bookings || 0} bookings
                        </div>
                        <div className="text-sm text-gray-500">
                          Rs. {activity.revenue || 0} revenue
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              activity.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {activity.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View Activity"
                            onClick={() => window.open(`/activities/${activity.id}`, '_blank')}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Activity"
                            onClick={() => handleEdit(activity)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete Activity"
                            onClick={() => handleDelete(activity)}
                            disabled={activity.id !== undefined && deleteInProgress === activity.id.toString()}
                          >                            {deleteInProgress === (activity.id ?? '').toString() ? (
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
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm
                        ? "No activities found matching your search"
                        : "No activities available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityManagement;
