import React, { useState, useEffect } from 'react';
import { Activity } from '../../types';

interface ActivityFormProps {
  activity: Activity | null;
  onSubmit: (activityData: Activity) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "Adventure",
  "Water Activities",
  "Cultural",
  "Wildlife",
  "Sightseeing"
];

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Activity>({
    id: 0,
    title: '',
    location: '',
    image: '',
    price: 0,
    availability: 0,
    rating: 0,
    description: '',
    duration: '',
    highlights: [],
    categories: [],
    additionalInfo: '',
    standardPackagePrice: 0,
    premiumPackagePrice: 0,
    familyPackagePrice: 0,
    standardPackageDescription: '',
    premiumPackageDescription: '',
    familyPackageDescription: '',
    active: true
  });

  const [highlightInput, setHighlightInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        highlights: activity.highlights || [],
        categories: activity.categories || [],
        standardPackagePrice: activity.standardPackagePrice || activity.price,
        premiumPackagePrice: activity.premiumPackagePrice || (activity.price + 1500),
        familyPackagePrice: activity.familyPackagePrice || (activity.price * 3),
        active: activity.active !== undefined ? activity.active : true
      });
    }
  }, [activity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (['price', 'availability', 'rating', 'standardPackagePrice', 'premiumPackagePrice', 'familyPackagePrice'].includes(name)) {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const categories = [...(prev.categories || [])];
      if (categories.includes(category)) {
        return {
          ...prev,
          categories: categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...categories, category]
        };
      }
    });
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...(prev.highlights || []), highlightInput.trim()]
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => {
      const highlights = [...(prev.highlights || [])];
      highlights.splice(index, 1);
      return {
        ...prev,
        highlights
      };
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.availability < 0) newErrors.availability = 'Availability cannot be negative';
    if (formData.rating < 0 || formData.rating > 5) newErrors.rating = 'Rating must be between 0 and 5';
    
    // Check package prices if provided
    if (formData.standardPackagePrice !== undefined && formData.standardPackagePrice <= 0) {
      newErrors.standardPackagePrice = 'Standard package price must be greater than 0';
    }
    if (formData.premiumPackagePrice !== undefined && formData.premiumPackagePrice <= 0) {
      newErrors.premiumPackagePrice = 'Premium package price must be greater than 0';
    }
    if (formData.familyPackagePrice !== undefined && formData.familyPackagePrice <= 0) {
      newErrors.familyPackagePrice = 'Family package price must be greater than 0';
    }
    
    // Validate image URL if provided
    if (formData.image && !formData.image.trim().match(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/)) {
      newErrors.image = 'Please enter a valid URL for the image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert string values to proper types before submission
      const preparedData = {
        ...formData,
        price: Number(formData.price),
        availability: Number(formData.availability),
        rating: Number(formData.rating),
        standardPackagePrice: formData.standardPackagePrice ? Number(formData.standardPackagePrice) : undefined,
        premiumPackagePrice: formData.premiumPackagePrice ? Number(formData.premiumPackagePrice) : undefined,
        familyPackagePrice: formData.familyPackagePrice ? Number(formData.familyPackagePrice) : undefined,
        active: formData.active !== undefined ? Boolean(formData.active) : true
      };
      
      onSubmit(preparedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-medium text-gray-700">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                  ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Location*</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                  ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="3-4 hours"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (Rs.)*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                  ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Availability</label>
              <input
                type="number"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                  ${errors.availability ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.availability && <p className="mt-1 text-sm text-red-600">{errors.availability}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                  ${errors.rating ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description*</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
                ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Information</label>
            <textarea
              name="additionalInfo"
              rows={3}
              value={formData.additionalInfo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Categories Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={(formData.categories || []).includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Highlights Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Tour Highlights</h3>
          
          <div className="flex">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Add a highlight"
            />
            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {(formData.highlights || []).map((highlight, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-sm">{highlight}</span>
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Packages Section */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="font-medium text-gray-700">Package Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Package */}
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <h4 className="font-medium text-gray-800">Standard Package</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                <input
                  type="number"
                  name="standardPackagePrice"
                  value={formData.standardPackagePrice}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="standardPackageDescription"
                  rows={3}
                  value={formData.standardPackageDescription}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Standard package includes..."
                />
              </div>
            </div>
            
            {/* Premium Package */}
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <h4 className="font-medium text-gray-800">Premium Package</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                <input
                  type="number"
                  name="premiumPackagePrice"
                  value={formData.premiumPackagePrice}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="premiumPackageDescription"
                  rows={3}
                  value={formData.premiumPackageDescription}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Premium package includes..."
                />
              </div>
            </div>
            
            {/* Family Package */}
            <div className="bg-gray-50 p-4 rounded-md space-y-4">
              <h4 className="font-medium text-gray-800">Family Package</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                <input
                  type="number"
                  name="familyPackagePrice"
                  value={formData.familyPackagePrice}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="familyPackageDescription"
                  rows={3}
                  value={formData.familyPackageDescription}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Family package includes..."
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">
              Active (visible to users)
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Activity
        </button>
      </div>
    </form>
  );
};

export default ActivityForm;
