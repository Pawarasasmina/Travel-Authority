import React, { useState, useEffect } from 'react';
import { Activity, ActivityPackage } from '../../types';

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

const emptyPackage: ActivityPackage = {
  name: '',
  keyIncludes: [],
  priceForeignAdult: 0,
  priceForeignKid: 0,
  priceLocalAdult: 0,
  priceLocalKid: 0,
  openingTime: '',
  averageTime: ''
};

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Activity>({
    id: 0,
    title: '',
    location: '',
    images: [], // CHANGED: support multiple images
    description: '',
    keyPoints: [],
    highlights: [],
    categories: [],
    additionalInfo: '',
    packages: [JSON.parse(JSON.stringify(emptyPackage))],
    active: true
  });

  const [keyPointInput, setKeyPointInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Add image handler
  const addImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  // Remove image handler
  const removeImage = (idx: number) => {
    setFormData(prev => {
      const images = [...(prev.images || [])];
      images.splice(idx, 1);
      return { ...prev, images };
    });
  };

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        keyPoints: activity.keyPoints || [],
        highlights: activity.highlights || [],
        categories: activity.categories || [],
        packages: activity.packages && activity.packages.length > 0 ? activity.packages : [JSON.parse(JSON.stringify(emptyPackage))],
        active: activity.active !== undefined ? activity.active : true
      });
    }
  }, [activity]);

  // Basic field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Category toggle
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

  // Key points
  const addKeyPoint = () => {
    if (keyPointInput.trim()) {
      setFormData(prev => ({
        ...prev,
        keyPoints: [...(prev.keyPoints || []), keyPointInput.trim()]
      }));
      setKeyPointInput('');
    }
  };
  const removeKeyPoint = (index: number) => {
    setFormData(prev => {
      const keyPoints = [...(prev.keyPoints || [])];
      keyPoints.splice(index, 1);
      return {
        ...prev,
        keyPoints
      };
    });
  };

  // Highlights
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

  // Packages
  const handlePackageChange = (idx: number, field: keyof ActivityPackage, value: any) => {
    setFormData(prev => {
      const packages = [...prev.packages];
      packages[idx] = { ...packages[idx], [field]: value };
      return { ...prev, packages };
    });
  };
  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, JSON.parse(JSON.stringify(emptyPackage))]
    }));
  };
  const removePackage = (idx: number) => {
    setFormData(prev => {
      const packages = [...prev.packages];
      packages.splice(idx, 1);
      return { ...prev, packages: packages.length ? packages : [JSON.parse(JSON.stringify(emptyPackage))] };
    });
  };
  // Key includes for each package
  const addKeyInclude = (pkgIdx: number, value: string) => {
    if (!value.trim()) return;
    setFormData(prev => {
      const packages = [...prev.packages];
      packages[pkgIdx].keyIncludes = [...(packages[pkgIdx].keyIncludes || []), value.trim()];
      return { ...prev, packages };
    });
  };
  const removeKeyInclude = (pkgIdx: number, keyIdx: number) => {
    setFormData(prev => {
      const packages = [...prev.packages];
      packages[pkgIdx].keyIncludes = [...packages[pkgIdx].keyIncludes];
      packages[pkgIdx].keyIncludes.splice(keyIdx, 1);
      return { ...prev, packages };
    });
  };

  // Checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Validation
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.images || formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.keyPoints || formData.keyPoints.length === 0) newErrors.keyPoints = 'At least one key point is required';
    if (!formData.packages || formData.packages.length === 0) newErrors.packages = 'At least one package is required';
    formData.packages.forEach((pkg, idx) => {
      if (!pkg.name.trim()) newErrors[`packageName${idx}`] = 'Package name required';
      if (!pkg.openingTime.trim()) newErrors[`packageOpeningTime${idx}`] = 'Opening time required';
      if (!pkg.averageTime.trim()) newErrors[`packageAverageTime${idx}`] = 'Average time required';
      if (pkg.priceForeignAdult <= 0) newErrors[`packagePriceForeignAdult${idx}`] = 'Foreign adult price required';
      if (pkg.priceForeignKid <= 0) newErrors[`packagePriceForeignKid${idx}`] = 'Foreign kid price required';
      if (pkg.priceLocalAdult <= 0) newErrors[`packagePriceLocalAdult${idx}`] = 'Local adult price required';
      if (pkg.priceLocalKid <= 0) newErrors[`packagePriceLocalKid${idx}`] = 'Local kid price required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        onSubmit(formData);
      } catch (err) {
        // Show error in UI if onSubmit throws
        setErrors(prev => ({ ...prev, submit: (err instanceof Error ? err.message : 'Unknown error occurred') }));
      }
    } else {
      setErrors(prev => ({ ...prev, submit: 'Please fix the errors above and try again.' }));
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
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.title ? 'border-red-500' : 'border-gray-300'}`}/>
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location*</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.location ? 'border-red-500' : 'border-gray-300'}`}/>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>
          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Images*</label>
            <div className="flex">
              <input type="text" value={imageInput} onChange={e => setImageInput(e.target.value)} className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Add image URL"/>
              <button type="button" onClick={addImage} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add</button>
            </div>
            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {(formData.images || []).map((img, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm break-all">{img}</span>
                  <button type="button" onClick={() => removeImage(idx)} className="text-red-600 hover:text-red-800">&times;</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description*</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`}/>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
        </div>
        {/* Categories Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center">
                <input type="checkbox" id={`category-${category}`} checked={(formData.categories || []).includes(category)} onChange={() => handleCategoryToggle(category)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">{category}</label>
              </div>
            ))}
          </div>
        </div>
        {/* Key Points Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-medium text-gray-700">Key Points</h3>
          <div className="flex">
            <input type="text" value={keyPointInput} onChange={e => setKeyPointInput(e.target.value)} className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Add a key point"/>
            <button type="button" onClick={addKeyPoint} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add</button>
          </div>
          {errors.keyPoints && <p className="mt-1 text-sm text-red-600">{errors.keyPoints}</p>}
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {(formData.keyPoints || []).map((point, idx) => (
              <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-sm">{point}</span>
                <button type="button" onClick={() => removeKeyPoint(idx)} className="text-red-600 hover:text-red-800">&times;</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Highlights Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-medium text-gray-700">Tour Highlights</h3>
          <div className="flex">
            <input type="text" value={highlightInput} onChange={e => setHighlightInput(e.target.value)} className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Add a highlight"/>
            <button type="button" onClick={addHighlight} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add</button>
          </div>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {(formData.highlights || []).map((highlight, idx) => (
              <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-sm">{highlight}</span>
                <button type="button" onClick={() => removeHighlight(idx)} className="text-red-600 hover:text-red-800">&times;</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Packages Section */}
        <div className="space-y-6 md:col-span-2">
          <h3 className="font-medium text-gray-700">Packages</h3>
          {errors.packages && <p className="mt-1 text-sm text-red-600">{errors.packages}</p>}
          {formData.packages.map((pkg, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-md space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">Package {idx + 1}</h4>
                {formData.packages.length > 1 && (
                  <button type="button" onClick={() => removePackage(idx)} className="text-red-600 hover:text-red-800">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package Name*</label>
                  <input type="text" value={pkg.name} onChange={e => handlePackageChange(idx, 'name', e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packageName${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packageName${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packageName${idx}`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opening Time*</label>
                  <input type="time" value={pkg.openingTime} onChange={e => handlePackageChange(idx, 'openingTime', e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packageOpeningTime${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packageOpeningTime${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packageOpeningTime${idx}`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Average Time*</label>
                  <input type="text" value={pkg.averageTime} onChange={e => handlePackageChange(idx, 'averageTime', e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packageAverageTime${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packageAverageTime${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packageAverageTime${idx}`]}</p>}
                </div>
              </div>
              {/* Key Includes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Key Includes</label>
                <KeyIncludesInput
                  keyIncludes={pkg.keyIncludes}
                  onAdd={val => addKeyInclude(idx, val)}
                  onRemove={keyIdx => removeKeyInclude(idx, keyIdx)}
                />
              </div>
              {/* Prices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Foreign Adult Price*</label>
                  <input type="number" value={pkg.priceForeignAdult} onChange={e => handlePackageChange(idx, 'priceForeignAdult', parseFloat(e.target.value) || 0)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packagePriceForeignAdult${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packagePriceForeignAdult${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packagePriceForeignAdult${idx}`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Foreign Kid Price*</label>
                  <input type="number" value={pkg.priceForeignKid} onChange={e => handlePackageChange(idx, 'priceForeignKid', parseFloat(e.target.value) || 0)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packagePriceForeignKid${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packagePriceForeignKid${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packagePriceForeignKid${idx}`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Local Adult Price*</label>
                  <input type="number" value={pkg.priceLocalAdult} onChange={e => handlePackageChange(idx, 'priceLocalAdult', parseFloat(e.target.value) || 0)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packagePriceLocalAdult${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packagePriceLocalAdult${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packagePriceLocalAdult${idx}`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Local Kid Price*</label>
                  <input type="number" value={pkg.priceLocalKid} onChange={e => handlePackageChange(idx, 'priceLocalKid', parseFloat(e.target.value) || 0)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors[`packagePriceLocalKid${idx}`] ? 'border-red-500' : 'border-gray-300'}`}/>
                  {errors[`packagePriceLocalKid${idx}`] && <p className="mt-1 text-sm text-red-600">{errors[`packagePriceLocalKid${idx}`]}</p>}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addPackage} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Another Package</button>
        </div>
        {/* Status */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input type="checkbox" id="active" name="active" checked={formData.active} onChange={handleCheckboxChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
            <label htmlFor="active" className="ml-2 text-sm text-gray-700">Active (visible to users)</label>
          </div>
        </div>
      </div>
      {errors.submit && (
        <div className="text-red-600 font-semibold text-center">{errors.submit}</div>
      )}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save Activity</button>
      </div>
    </form>
  );
};

// KeyIncludesInput component for package key includes
const KeyIncludesInput: React.FC<{ keyIncludes: string[]; onAdd: (val: string) => void; onRemove: (idx: number) => void }> = ({ keyIncludes, onAdd, onRemove }) => {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex mb-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Add a key include"/>
        <button type="button" onClick={() => { onAdd(input); setInput(''); }} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add</button>
      </div>
      <ul className="space-y-2 max-h-24 overflow-y-auto">
        {keyIncludes.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <span className="text-sm">{item}</span>
            <button type="button" onClick={() => onRemove(idx)} className="text-red-600 hover:text-red-800">&times;</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityForm;
