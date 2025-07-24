import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Plus, Search, Trash2, Edit, Eye, X, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as activityApi from '../../api/activityApi';
import { debugLog } from '../../utils/debug';
import { Activity } from '../../types';
import ActivityForm from './ActivityForm';

// Extended Activity interface for owner activities
interface OwnerActivity extends Activity {
  bookings?: number;
  revenue?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  createdBy?: string;
}

const OwnerActivityManagement: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<OwnerActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<OwnerActivity | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<OwnerActivity | null>(null);

  useEffect(() => {
    if (user && user.email) {
      fetchActivities(user.email);
    }
  }, [refreshKey, user]);

  const fetchActivities = async (email: string) => {
    try {
      setLoading(true);
      debugLog('OWNER_ACTIVITIES', 'Fetching owner activities');

      const activitiesData = await activityApi.fetchActivitiesByOwner(email);
      setActivities(activitiesData || []);
      debugLog('OWNER_ACTIVITIES', 'Activities loaded', activitiesData);
    } catch (err: any) {
      debugLog('OWNER_ACTIVITIES', 'Error fetching activities', err);
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

  const handleEdit = (activity: OwnerActivity) => {
    setCurrentActivity(activity);
    setShowForm(true);
  };

  const handleViewDetails = (activity: OwnerActivity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setCurrentActivity(null);
  };

  const handleDelete = async (activity: OwnerActivity) => {
    if (!activity.id) {
      alert('Cannot delete activity: Missing ID');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      return;
    }
    
    try {
      setDeleteInProgress(activity.id.toString());
      const response = await activityApi.deleteActivity(activity.id as number);
      
      if (response.status === 'OK' || response.status === '200 OK' || response.status === 'NO_CONTENT') {
        setSuccessMessage(`Activity "${activity.title}" deleted successfully`);
        setRefreshKey(prevKey => prevKey + 1); // Trigger reload of activities
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        alert(`Failed to delete activity: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error deleting activity: ${err.message || 'Unknown error'}`);
    } finally {
      setDeleteInProgress(null);
    }
  };

  const handleFormSubmit = async (activity: Activity) => {
    try {
      // Create an OwnerActivity with createdBy property
      const ownerActivity = {
        ...activity,
        createdBy: user?.email
      };
      
      // Save or update the activity
      let response;
      if (activity.id) {
        response = await activityApi.updateActivity(activity.id as number, ownerActivity);
      } else {
        response = await activityApi.createActivity(ownerActivity);
      }
      
      if (response.status === 'OK' || response.status === '200 OK' || response.success) {
        setShowForm(false);
        setRefreshKey(prevKey => prevKey + 1); // Trigger reload of activities
        setSuccessMessage(`Activity "${activity.title}" ${activity.id ? 'updated' : 'created'} successfully`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        alert(`Failed to ${activity.id ? 'update' : 'create'} activity: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error ${activity.id ? 'updating' : 'creating'} activity: ${err.message || 'Unknown error'}`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex justify-between">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)}>
            <X size={18} />
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <ActivityIcon size={24} className="mr-2" />
          My Activities
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <ActivityIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-500 mb-6">You haven't created any activities yet. Create your first activity to get started.</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} />
            Create Activity
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Activity</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Start Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActivities.map(activity => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {activity.description?.substring(0, 60)}
                      {activity.description && activity.description.length > 60 ? '...' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {activity.location || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(activity.startDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.active ? (
                        <>
                          <Check size={14} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <X size={14} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(activity)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(activity)}
                        className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(activity)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                        disabled={deleteInProgress === activity.id?.toString()}
                      >
                        {deleteInProgress === activity.id?.toString() ? (
                          <div className="animate-spin h-4 w-4 border-t-2 border-red-500 rounded-full"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {currentActivity ? 'Edit Activity' : 'Create New Activity'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <ActivityForm
                activity={currentActivity || null}
                onSubmit={handleFormSubmit}
                onCancel={handleFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedActivity.title}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Activity Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="mt-1">{selectedActivity.description || 'No description provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="mt-1 font-medium">{selectedActivity.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedActivity.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedActivity.active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="mt-1 font-medium">{formatDate(selectedActivity.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="mt-1 font-medium">{formatDate(selectedActivity.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="mt-1 font-medium">{selectedActivity.category || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="mt-1 font-medium">{selectedActivity.duration || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Packages</h3>
                  {selectedActivity.packages && selectedActivity.packages.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-4">
                        {selectedActivity.packages.map((pkg, index) => (
                          <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{pkg.name}</h4>
                              <span className="font-semibold">${pkg.price}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                            <div className="mt-2 flex gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Price:</span> ${pkg.price}
                              </div>
                              <div>
                                <span className="text-gray-500">Availability:</span> {pkg.availability || 'Unlimited'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                      No packages available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedActivity);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerActivityManagement;
