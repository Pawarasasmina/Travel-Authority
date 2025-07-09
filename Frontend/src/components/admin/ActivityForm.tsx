import React, { useState, useEffect } from 'react';
import { Activity, Package } from '../../types';

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
    packages: [],
    active: true
  });

  const [highlightInput, setHighlightInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentPackage, setCurrentPackage] = useState<Package>({
    name: '',
    description: '',
    price: 0,
    foreignAdultPrice: 0,
    foreignKidPrice: 0,
    localAdultPrice: 0,
    localKidPrice: 0,
    features: [],
    images: []
  });
  const [packageFeatureInput, setPackageFeatureInput] = useState('');
  const [packageImageInput, setPackageImageInput] = useState('');
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        highlights: activity.highlights || [],
        categories: activity.categories || [],
        packages: activity.packages || [],
        active: activity.active !== undefined ? activity.active : true
      });
    }
  }, [activity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (['price', 'availability', 'rating'].includes(name)) {
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

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields for pricing
    if (['price', 'foreignAdultPrice', 'foreignKidPrice', 'localAdultPrice', 'localKidPrice'].includes(name)) {
      setCurrentPackage({
        ...currentPackage,
        [name]: parseFloat(value) || 0
      });
    } else {
      setCurrentPackage({
        ...currentPackage,
        [name]: value
      });
    }
  };

  const addPackageFeature = () => {
    if (packageFeatureInput.trim()) {
      setCurrentPackage(prev => ({
        ...prev,
        features: [...prev.features, packageFeatureInput.trim()]
      }));
      setPackageFeatureInput('');
    }
  };

  const removePackageFeature = (index: number) => {
    setCurrentPackage(prev => {
      const features = [...prev.features];
      features.splice(index, 1);
      return {
        ...prev,
        features
      };
    });
  };

  const addPackageImage = () => {
    if (packageImageInput.trim() && currentPackage.images.length < 3) {
      setCurrentPackage(prev => ({
        ...prev,
        images: [...prev.images, packageImageInput.trim()]
      }));
      setPackageImageInput('');
    }
  };

  const removePackageImage = (index: number) => {
    setCurrentPackage(prev => {
      const images = [...prev.images];
      images.splice(index, 1);
      return {
        ...prev,
        images
      };
    });
  };

  const addPackage = () => {
    // Check if package name is provided and at least one pricing field is filled
    const hasValidPricing = currentPackage.foreignAdultPrice > 0 || 
                           currentPackage.foreignKidPrice > 0 || 
                           currentPackage.localAdultPrice > 0 || 
                           currentPackage.localKidPrice > 0;
    
    if (currentPackage.name.trim() && hasValidPricing) {
      if (editingPackageIndex !== null) {
        // Update existing package
        const updatedPackages = [...(formData.packages || [])];
        updatedPackages[editingPackageIndex] = currentPackage;
        setFormData(prev => ({
          ...prev,
          packages: updatedPackages
        }));
        setEditingPackageIndex(null);
      } else {
        // Add new package
        setFormData(prev => ({
          ...prev,
          packages: [...(prev.packages || []), currentPackage]
        }));
      }
      
      // Reset package form
      setCurrentPackage({
        name: '',
        description: '',
        price: 0,
        foreignAdultPrice: 0,
        foreignKidPrice: 0,
        localAdultPrice: 0,
        localKidPrice: 0,
        features: [],
        images: []
      });
      setPackageFeatureInput('');
      setPackageImageInput('');
    }
  };

  const editPackage = (index: number) => {
    const packageToEdit = formData.packages?.[index];
    if (packageToEdit) {
      setCurrentPackage(packageToEdit);
      setEditingPackageIndex(index);
    }
  };

  const removePackage = (index: number) => {
    setFormData(prev => {
      const packages = [...(prev.packages || [])];
      packages.splice(index, 1);
      return {
        ...prev,
        packages
      };
    });
  };

  const cancelPackageEdit = () => {
    setCurrentPackage({
      name: '',
      description: '',
      price: 0,
      foreignAdultPrice: 0,
      foreignKidPrice: 0,
      localAdultPrice: 0,
      localKidPrice: 0,
      features: [],
      images: []
    });
    setEditingPackageIndex(null);
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
    
    // Validate packages
    if (!formData.packages || formData.packages.length === 0) {
      newErrors.packages = 'At least one package is required';
    } else {
      formData.packages.forEach((pkg, index) => {
        if (!pkg.name?.trim()) newErrors[`package_${index}_name`] = 'Package name is required';
        if (pkg.price <= 0) newErrors[`package_${index}_price`] = 'Package price must be greater than 0';
      });
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
        packages: formData.packages?.map(pkg => ({
          ...pkg,
          price: Number(pkg.price)
        })),
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
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Packages*</h3>
            <span className="text-sm text-gray-500">Create custom packages for this activity</span>
          </div>
          
          {errors.packages && <p className="text-sm text-red-600">{errors.packages}</p>}
          
          {/* Package Form */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <h4 className="font-medium text-gray-800">
              {editingPackageIndex !== null ? 'Edit Package' : 'Add New Package'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Package Name*</label>
                <input
                  type="text"
                  name="name"
                  value={currentPackage.name}
                  onChange={handlePackageChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Standard, Premium, Family"
                />
              </div>
            </div>
            
            {/* Pricing Section */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Package Pricing (Rs.)*</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Foreign Adult</label>
                  <input
                    type="number"
                    name="foreignAdultPrice"
                    value={currentPackage.foreignAdultPrice}
                    onChange={handlePackageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600">Foreign Kid</label>
                  <input
                    type="number"
                    name="foreignKidPrice"
                    value={currentPackage.foreignKidPrice}
                    onChange={handlePackageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600">Local Adult</label>
                  <input
                    type="number"
                    name="localAdultPrice"
                    value={currentPackage.localAdultPrice}
                    onChange={handlePackageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600">Local Kid</label>
                  <input
                    type="number"
                    name="localKidPrice"
                    value={currentPackage.localKidPrice}
                    onChange={handlePackageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">Base Price (Rs.) - Legacy Support</label>
                <input
                  type="number"
                  name="price"
                  value={currentPackage.price}
                  onChange={handlePackageChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="For backward compatibility"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={2}
                value={currentPackage.description}
                onChange={handlePackageChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Brief description of what this package includes..."
              />
            </div>
            
            {/* Package Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Features</label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={packageFeatureInput}
                  onChange={(e) => setPackageFeatureInput(e.target.value)}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add a feature"
                />
                <button
                  type="button"
                  onClick={addPackageFeature}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {currentPackage.features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-2 rounded-md border">
                    <span className="text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removePackageFeature(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Package Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Images (Max 3)
                <span className="text-xs text-gray-500 ml-2">
                  ({currentPackage.images.length}/3)
                </span>
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={packageImageInput}
                  onChange={(e) => setPackageImageInput(e.target.value)}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add an image URL (https://...)"
                  disabled={currentPackage.images.length >= 3}
                />
                <button
                  type="button"
                  onClick={addPackageImage}
                  disabled={currentPackage.images.length >= 3 || !packageImageInput.trim()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              {currentPackage.images.length >= 3 && (
                <p className="text-sm text-amber-600 mb-2">
                  Maximum of 3 images allowed per package
                </p>
              )}
              
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {currentPackage.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                    <div className="flex items-center space-x-3 flex-1">
                      <img 
                        src={image} 
                        alt={`Package ${index + 1}`}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkMyMS43OTA5IDE2IDE5Ljk5OTkgMTcuNzkwOSAxOS45OTk5IDIwQzE5Ljk5OTkgMjIuMjA5MSAyMS43OTA5IDI0IDI0IDI0QzI2LjIwOTEgMjQgMjggMjIuMjA5MSAyOCAyMEMyOCAxNy43OTA5IDI2LjIwOTEgMTYgMjQgMTYiIGZpbGw9IiM5Q0E2QUYiLz4KPHBhdGggZD0iTTEyIDEyVjM2SDE0VjE0SDM0VjM2SDM2VjEySDEyWiIgZmlsbD0iIzlDQTZBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                      <span className="text-sm text-gray-600 truncate flex-1">
                        {image.length > 50 ? `${image.substring(0, 50)}...` : image}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePackageImage(index)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addPackage}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                disabled={!currentPackage.name.trim() || 
                  (currentPackage.foreignAdultPrice <= 0 && 
                   currentPackage.foreignKidPrice <= 0 && 
                   currentPackage.localAdultPrice <= 0 && 
                   currentPackage.localKidPrice <= 0)}
              >
                {editingPackageIndex !== null ? 'Update Package' : 'Add Package'}
              </button>
              
              {editingPackageIndex !== null && (
                <button
                  type="button"
                  onClick={cancelPackageEdit}
                  className="px-4 py-2 bg-gray-300 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-400"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
          
          {/* Existing Packages List */}
          {formData.packages && formData.packages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Created Packages ({formData.packages.length})</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.packages.map((pkg, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{pkg.name}</h5>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Base Price</div>
                        <span className="text-lg font-bold text-blue-600">Rs. {pkg.price}</span>
                      </div>
                    </div>
                    
                    {/* Specific Pricing Display */}
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="text-xs font-medium text-gray-700 mb-1">Pricing Details</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Foreign Adult:</span>
                          <span className="font-medium">Rs. {pkg.foreignAdultPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Foreign Kid:</span>
                          <span className="font-medium">Rs. {pkg.foreignKidPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Local Adult:</span>
                          <span className="font-medium">Rs. {pkg.localAdultPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Local Kid:</span>
                          <span className="font-medium">Rs. {pkg.localKidPrice}</span>
                        </div>
                      </div>
                    </div>
                    
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    )}
                    
                    {pkg.features.length > 0 && (
                      <ul className="text-sm text-gray-600 mb-3 space-y-1">
                        {pkg.features.map((feature, featIndex) => (
                          <li key={featIndex} className="flex items-start">
                            <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Package Images */}
                    {pkg.images && pkg.images.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Images ({pkg.images.length})</div>
                        <div className="grid grid-cols-3 gap-2">
                          {pkg.images.map((image, imgIndex) => (
                            <img 
                              key={imgIndex}
                              src={image} 
                              alt={`${pkg.name} ${imgIndex + 1}`}
                              className="w-full h-16 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyOS4yOTA5IDIwIDI3Ljk5OTkgMjIuMjkwOSAyNy45OTk5IDI1QzI3Ljk5OTkgMjcuNzA5MSAyOS4yOTA5IDMwIDMyIDMwQzM0LjcwOTEgMzAgMzYgMjcuNzA5MSAzNiAyNUMzNiAyMi4yOTA5IDM0LjcwOTEgMjAgMzIgMjAiIGZpbGw9IiM5Q0E2QUYiLz4KPHBhdGggZD0iTTE2IDE2VjQ4SDE4VjE4SDQ2VjQ4SDQ4VjE2SDE2WiIgZmlsbD0iIzlDQTZBRiIvPgo8L3N2Zz4K';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => editPackage(index)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
