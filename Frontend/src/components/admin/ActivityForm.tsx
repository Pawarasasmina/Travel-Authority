import React, { useState, useEffect } from 'react';
import { Activity, Package } from '../../types';
import { Plus, X, Image as ImageIcon, Star, MapPin, Clock, Users, Tag, Info, Package as PackageIcon, Check } from 'lucide-react';

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
        price: Number(formData.price) || 0,
        availability: Number(formData.availability) || 0,
        rating: Number(formData.rating) || 0,
        packages: formData.packages?.map(pkg => ({
          ...pkg,
          id: pkg.id || undefined, // Use undefined instead of null to match Package type
          price: Number(pkg.price) || 0,
          foreignAdultPrice: Number(pkg.foreignAdultPrice) || 0,
          foreignKidPrice: Number(pkg.foreignKidPrice) || 0,
          localAdultPrice: Number(pkg.localAdultPrice) || 0,
          localKidPrice: Number(pkg.localKidPrice) || 0,
          features: pkg.features || [],
          images: pkg.images || []
        })) || [],
        active: formData.active !== undefined ? Boolean(formData.active) : true
      };
      
      onSubmit(preparedData as Activity);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="bg-black px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activity ? 'Edit Activity' : 'Create New Activity'}
                </h1>
                <p className="text-gray-300">
                  {activity ? 'Update your activity details' : 'Add a new exciting travel experience'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Basic Info</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Categories</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <PackageIcon className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Packages</span>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Info className="w-5 h-5 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title and Location */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Title *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter an exciting activity title"
                    />
                    <Star className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                        errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Where is this activity located?"
                    />
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                      placeholder="e.g., 3-4 hours, Full day"
                    />
                    <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Image and Metrics */}
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {formData.image && (
                    <div className="mt-3 relative">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                        errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="0"
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                          errors.availability ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        placeholder="0"
                      />
                      <Users className="absolute left-2.5 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.availability && <p className="mt-1 text-xs text-red-600">{errors.availability}</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 ${
                        errors.rating ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="4.5"
                    />
                    {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Describe what makes this activity special and exciting..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Additional Information */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                rows={3}
                value={formData.additionalInfo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 resize-none bg-white"
                placeholder="Any additional details, requirements, or important notes..."
              />
            </div>
          </div>

          {/* Categories and Highlights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categories */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Categories</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      (formData.categories || []).includes(category)
                        ? 'bg-gray-100 border-gray-400 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(formData.categories || []).includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-5 h-5 text-gray-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-gray-500"
                    />
                    <span className="ml-3 font-medium text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Tour Highlights</h3>
              </div>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                  placeholder="Add a highlight"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                />
                <button
                  type="button"
                  onClick={addHighlight}
                  className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(formData.highlights || []).map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Packages Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <PackageIcon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Activity Packages</h3>
              </div>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                {formData.packages?.length || 0} packages created
              </span>
            </div>
            
            {errors.packages && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.packages}
                </p>
              </div>
            )}

            {/* Package Form */}
            <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-gray-700" />
                {editingPackageIndex !== null ? 'Edit Package' : 'Create New Package'}
              </h4>
              
              <div className="space-y-4">
                {/* Package Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentPackage.name}
                    onChange={handlePackageChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                    placeholder="e.g., Standard Tour, Premium Experience, Family Package"
                  />
                </div>

                {/* Package Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    value={currentPackage.description}
                    onChange={handlePackageChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 resize-none bg-white"
                    placeholder="Brief description of what this package includes..."
                  />
                </div>

                {/* Pricing Grid */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-gray-700" />
                    Package Pricing (Rs.) *
                  </h5>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Foreign Adult</label>
                      <input
                        type="number"
                        name="foreignAdultPrice"
                        value={currentPackage.foreignAdultPrice}
                        onChange={handlePackageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Foreign Kid</label>
                      <input
                        type="number"
                        name="foreignKidPrice"
                        value={currentPackage.foreignKidPrice}
                        onChange={handlePackageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Local Adult</label>
                      <input
                        type="number"
                        name="localAdultPrice"
                        value={currentPackage.localAdultPrice}
                        onChange={handlePackageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Local Kid</label>
                      <input
                        type="number"
                        name="localKidPrice"
                        value={currentPackage.localKidPrice}
                        onChange={handlePackageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-white"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (Rs.) - Legacy Support
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={currentPackage.price}
                      onChange={handlePackageChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                      placeholder="For backward compatibility"
                    />
                  </div>
                </div>

                {/* Package Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Features
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={packageFeatureInput}
                      onChange={(e) => setPackageFeatureInput(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPackageFeature())}
                    />
                    <button
                      type="button"
                      onClick={addPackageFeature}
                      className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {currentPackage.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                      >                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                        <button
                          type="button"
                          onClick={() => removePackageFeature(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Package Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Images (Max 3)
                    <span className="text-xs text-gray-500 ml-2">
                      ({currentPackage.images.length}/3)
                    </span>
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={packageImageInput}
                      onChange={(e) => setPackageImageInput(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                      placeholder="Add an image URL (https://...)"
                      disabled={currentPackage.images.length >= 3}
                    />
                    <button
                      type="button"
                      onClick={addPackageImage}
                      disabled={currentPackage.images.length >= 3 || !packageImageInput.trim()}
                      className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {currentPackage.images.length >= 3 && (
                    <p className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded border border-gray-200">
                      Maximum of 3 images allowed per package
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {currentPackage.images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                        <div className="flex items-center space-x-3 flex-1">
                          <img 
                            src={image} 
                            alt={`Package ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border"
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
                          className="text-red-500 hover:text-red-700 ml-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Package Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={addPackage}
                    className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Packages Display */}
            {formData.packages && formData.packages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <PackageIcon className="w-5 h-5 mr-2 text-gray-700" />
                  Created Packages ({formData.packages.length})
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {formData.packages.map((pkg, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900 truncate mr-2">{pkg.name}</h5>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Base Price</div>
                          <span className="text-lg font-bold text-gray-900">Rs. {pkg.price}</span>
                        </div>
                      </div>
                      
                      {/* Pricing Details */}
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-2">Pricing Details</div>
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
                        <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded border border-gray-200">{pkg.description}</p>
                      )}
                      
                      {pkg.features.length > 0 && (
                        <ul className="text-sm text-gray-600 mb-3 space-y-1">
                          {pkg.features.slice(0, 3).map((feature, featIndex) => (
                            <li key={featIndex} className="flex items-start">
                              <Check className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {pkg.features.length > 3 && (
                            <li className="text-xs text-gray-500 italic">
                              +{pkg.features.length - 3} more features...
                            </li>
                          )}
                        </ul>
                      )}
                      
                      {/* Package Images */}
                      {pkg.images && pkg.images.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-2">Images ({pkg.images.length})</div>
                          <div className="grid grid-cols-3 gap-1">
                            {pkg.images.map((image, imgIndex) => (
                              <img 
                                key={imgIndex}
                                src={image} 
                                alt={`${pkg.name} ${imgIndex + 1}`}
                                className="w-full h-12 object-cover rounded border"
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
                          className="flex-1 text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removePackage(index)}
                          className="flex-1 text-sm px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
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

          {/* Activity Status */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Check className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Activity Status</h3>
                  <p className="text-sm text-gray-600">Control visibility to users</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleCheckboxChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white rounded-lg shadow-lg font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
            >
              {activity ? 'Update Activity' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
