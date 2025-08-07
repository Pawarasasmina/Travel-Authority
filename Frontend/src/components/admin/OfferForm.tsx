import React, { useState, useEffect } from 'react';
import { X, ImageIcon, Calendar, Percent, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as activityApi from '../../api/activityApi';
import { Activity, Package } from '../../types';
import { debugLog } from '../../utils/debug';

interface OfferFormProps {
  offer: any;
  onSave: (offerData: any) => void;
  onCancel: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ offer, onSave, onCancel }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    image: '',
    discount: '',
    discountPercentage: 0,
    active: true,
    activityId: 0,
    activityTitle: '',
    startDate: '',
    endDate: '',
    selectedPackages: [] as number[]
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    image?: string;
    discountPercentage?: string;
    activityId?: string;
    dates?: string;
    selectedPackages?: string;
  }>({});

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  // Load activities based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        fetchAllActivities(); // Admins can see all activities
      } else if (user.email) {
        fetchOwnerActivities(user.email); // Owners see only their activities
      }
    }
  }, [user]);
  
  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      const response = await activityApi.fetchAllActivities();
      if (Array.isArray(response)) {
        setActivities(response);
        
        // If editing an offer with an activityId, set the selected activity
        if (offer && offer.activityId) {
          const activity = response.find(act => act.id === offer.activityId);
          if (activity) {
            setSelectedActivity(activity);
          }
        }
      }
    } catch (err) {
      debugLog('OFFER_FORM', 'Error fetching all activities', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerActivities = async (email: string) => {
    try {
      setLoading(true);
      const response = await activityApi.fetchActivitiesByOwner(email);
      if (Array.isArray(response)) {
        setActivities(response);
        
        // If editing an offer with an activityId, set the selected activity
        if (offer && offer.activityId) {
          const activity = response.find(act => act.id === offer.activityId);
          if (activity) {
            setSelectedActivity(activity);
          }
        }
      }
    } catch (err) {
      debugLog('OFFER_FORM', 'Error fetching owner activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offer) {
      setFormData({
        id: offer.id || 0,
        title: offer.title || '',
        image: offer.image || '',
        discount: offer.discount || '',
        discountPercentage: offer.discountPercentage || 0,
        active: offer.active !== undefined ? offer.active : true,
        activityId: offer.activityId || 0,
        activityTitle: offer.activityTitle || '',
        startDate: offer.startDate ? formatDateForInput(offer.startDate) : '',
        endDate: offer.endDate ? formatDateForInput(offer.endDate) : '',
        selectedPackages: offer.selectedPackages || []
      });
      
      // If the offer has an activityId, find and set the selected activity
      if (offer.activityId && activities.length > 0) {
        const activity = activities.find(act => act.id === offer.activityId);
        if (activity) {
          setSelectedActivity(activity);
        }
      }
    }
  }, [offer, activities]);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else if (name === 'activityId') {
      const selectedId = parseInt(value);
      const activity = activities.find(act => act.id === selectedId);
      
      setFormData({
        ...formData,
        activityId: selectedId,
        activityTitle: activity ? activity.title : '',
        selectedPackages: [] // Reset selected packages when activity changes
      });
      
      setSelectedActivity(activity || null);
    } else if (name === 'discountPercentage') {
      // Ensure discount percentage is a number between 0 and 100
      const percentage = Math.min(Math.max(0, parseFloat(value) || 0), 100);
      setFormData({
        ...formData,
        discountPercentage: percentage,
        discount: `${percentage}% OFF` // Update the display discount text as well
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePackageSelection = (packageId: number) => {
    const isSelected = formData.selectedPackages.includes(packageId);
    
    if (isSelected) {
      setFormData({
        ...formData,
        selectedPackages: formData.selectedPackages.filter(id => id !== packageId)
      });
    } else {
      setFormData({
        ...formData,
        selectedPackages: [...formData.selectedPackages, packageId]
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      image?: string;
      discountPercentage?: string;
      activityId?: string;
      dates?: string;
      selectedPackages?: string;
    } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    
    if (formData.discountPercentage <= 0) {
      newErrors.discountPercentage = 'Discount percentage must be greater than 0';
    }
    
    if (formData.activityId <= 0) {
      newErrors.activityId = 'Activity selection is required';
    }
    
    if (!formData.startDate || !formData.endDate) {
      newErrors.dates = 'Start and end dates are required';
    } else if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.dates = 'End date must be after start date';
    }
    
    if (formData.selectedPackages.length === 0) {
      newErrors.selectedPackages = 'At least one package must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {formData.id ? 'Edit Offer' : 'Add New Offer'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Admin information */}
      {user?.role === 'ADMIN' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Administrator Access</p>
              <p className="text-sm text-blue-600">As an admin, you can create offers for any activity and any package in the system.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Title */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              }`}
              placeholder="Enter an appealing offer title"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL *
            </label>
            <div className="relative">
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                  errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.image && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.image}
              </p>
            )}
            {formData.image && (
              <div className="mt-3 relative">
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Activity Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Activity *
              {user?.role === 'ADMIN' && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  (As admin, you can select any activity)
                </span>
              )}
            </label>
            <select
              name="activityId"
              value={formData.activityId}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                errors.activityId ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            >
              <option value={0}>Select an activity</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.title} {activity.ownerEmail && activity.ownerEmail !== user?.email ? `(Owner: ${activity.ownerEmail})` : ''}
                </option>
              ))}
            </select>
            {errors.activityId && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.activityId}
              </p>
            )}
          </div>
          
          {/* Package Selection */}
          {selectedActivity && selectedActivity.packages && selectedActivity.packages.length > 0 ? (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Packages for Discount *
                {user?.role === 'ADMIN' && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (As admin, you can select any package)
                  </span>
                )}
              </label>
              <div className="space-y-2 mt-2">
                {selectedActivity.packages.map(pkg => (
                  <div key={pkg.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`package-${pkg.id}`}
                      checked={pkg.id ? formData.selectedPackages.includes(pkg.id) : false}
                      onChange={() => pkg.id && handlePackageSelection(pkg.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`package-${pkg.id}`} className="ml-2 block text-sm text-gray-700">
                      {pkg.name} - {pkg.description} (Local: ₹{pkg.localAdultPrice}/adult, Foreign: ₹{pkg.foreignAdultPrice}/adult)
                    </label>
                  </div>
                ))}
              </div>
              {errors.selectedPackages && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.selectedPackages}
                </p>
              )}
            </div>
          ) : selectedActivity ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    This activity doesn't have any packages. Please add packages to the activity first.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Discount Percentage */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage * 
            </label>
            <div className="relative">
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                  errors.discountPercentage ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="e.g., 15"
              />
              <Percent className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.discountPercentage && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.discountPercentage}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This will automatically apply {formData.discountPercentage}% discount to selected packages during booking.
            </p>
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                    errors.dates ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                    errors.dates ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                />
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          {errors.dates && (
            <p className="mt-0 text-sm text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1" />
              {errors.dates}
            </p>
          )}

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active (show on homepage)
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              {formData.id ? 'Update Offer' : 'Create Offer'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;
