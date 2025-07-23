import React, { useState, useEffect } from 'react';
import { X, ImageIcon } from 'lucide-react';

interface OfferFormProps {
  offer: any;
  onSave: (offerData: any) => void;
  onCancel: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ offer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    image: '',
    discount: '',
    active: true
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    image?: string;
  }>({});

  useEffect(() => {
    if (offer) {
      setFormData({
        id: offer.id || 0,
        title: offer.title || '',
        image: offer.image || '',
        discount: offer.discount || '',
        active: offer.active !== undefined ? offer.active : true
      });
    }
  }, [offer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      image?: string;
    } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
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

          {/* Discount */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (Optional)
            </label>
            <input
              type="text"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
              placeholder="e.g., 30% OFF"
            />
          </div>

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
