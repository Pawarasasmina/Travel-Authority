import React, { useState, useEffect } from 'react';
import { Check, X, Edit, Trash2, Plus, RefreshCcw, ImageIcon, Info } from 'lucide-react';
import { debugLog } from '../../utils/debug';
import * as offerApi from '../../api/offerApi';
import OfferForm from './OfferForm';
import { useAuth } from '../../hooks/useAuth';

interface Offer {
    id: number;
    title: string;
    image: string;
    discount?: string;
    discountPercentage?: number;
    active?: boolean;
    activityId?: number;
    activityTitle?: string;
    startDate?: string;
    endDate?: string;
    createdBy?: string;
    selectedPackages?: number[]; 
}

const OfferManagement: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<string | null>(null);
  
  // Filtered offers based on search term and owner filter
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = !filterOwner || offer.createdBy === filterOwner;
    return matchesSearch && matchesOwner;
  });

  useEffect(() => {
    fetchOffers();
  }, [refreshKey]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      debugLog('ADMIN_OFFERS', 'Fetching offers');
      
      const response = await offerApi.getAllOffers();
      
      if (response.status === 'OK' || response.status === '200 OK' || response.success === true) {
        debugLog('ADMIN_OFFERS', 'Offers loaded successfully', response.data);
        setOffers(response.data || []);
        setError(null);
      } else {
        debugLog('ADMIN_OFFERS', 'Failed to load offers', response);
        setError(response.message || 'Failed to load offers');
        setOffers([]);
      }
    } catch (err) {
      debugLog('ADMIN_OFFERS', 'Error fetching offers', err);
      setError('Failed to load offers. Please try again.');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = () => {
    setSelectedOffer(null);
    setShowForm(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowForm(true);
  };

  const handleDeleteOffer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        debugLog('ADMIN_OFFERS', `Deleting offer ${id}`);
        
        const response = await offerApi.deleteOffer(id);
        
        if (response.status === 'OK' || response.status === '200 OK' || response.success === true) {
          debugLog('ADMIN_OFFERS', 'Offer deleted successfully');
          setSuccessMessage(`Offer deleted successfully`);
          setTimeout(() => setSuccessMessage(null), 5000);
          setRefreshKey(prevKey => prevKey + 1);
        } else {
          debugLog('ADMIN_OFFERS', 'Failed to delete offer', response);
          setError(response.message || 'Failed to delete offer');
        }
      } catch (err) {
        debugLog('ADMIN_OFFERS', 'Error deleting offer', err);
        setError('Failed to delete offer. Please try again.');
      }
    }
  };

  const handleSaveOffer = async (offerData: any) => {
    try {
      debugLog('ADMIN_OFFERS', 'Processing save offer request', { 
        id: offerData.id, 
        title: offerData.title
      });
      
      const response = await offerApi.saveOffer(offerData);
      
      debugLog('ADMIN_OFFERS', 'Response status:', response.status);
      
      if (response.status === 'OK' || response.status === '200 OK' || response.status === 'CREATED' || 
          response.status === '201 CREATED' || response.success === true) {
        debugLog('ADMIN_OFFERS', 'Offer saved successfully', response.data);
        setShowForm(false);
        // Set success message in the UI
        setSuccessMessage(`Offer "${offerData.title}" saved successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        debugLog('ADMIN_OFFERS', 'Failed to save offer', response);
        setError(response.message || 'Failed to save offer');
      }
    } catch (err) {
      debugLog('ADMIN_OFFERS', 'Error saving offer', err);
      setError('Failed to save offer. Please try again.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedOffer(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showForm) {
    return <OfferForm offer={selectedOffer} onSave={handleSaveOffer} onCancel={handleCancelForm} />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Special Offers Management</h2>
          <p className="text-sm text-gray-500">
            Manage the offers that appear in the slider on the home page
          </p>
        </div>
        <button 
          onClick={handleAddOffer}
          className="mt-3 md:mt-0 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add New Offer
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
          <X className="w-5 h-5 mr-2" />
          {error}
          <button 
            className="ml-auto text-red-600 hover:text-red-800"
            onClick={() => setError(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Admin info message */}
      {user?.role === 'ADMIN' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Administrator Access</p>
              <p className="text-sm text-blue-600">As an admin, you can manage offers for all activities in the system. Use the filter options below to narrow down the list.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Refresh Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search offers..."
            className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-3.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {user?.role === 'ADMIN' && (
          <select 
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filterOwner || ''}
            onChange={(e) => setFilterOwner(e.target.value || null)}
          >
            <option value="">All Owners</option>
            {/* Create a unique list of owner emails */}
            {[...new Set(offers.map(offer => offer.createdBy).filter(Boolean))].map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
        )}
        
        <button
          onClick={() => setRefreshKey(prevKey => prevKey + 1)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-600"
          title="Refresh offers"
        >
          <RefreshCcw size={18} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No offers found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? "No offers match your search criteria" 
              : "There are no offers created yet"}
          </p>
          <button
            onClick={handleAddOffer}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Create Your First Offer
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOffers.map(offer => (
                <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={offer.image} 
                        alt={offer.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150x150?text=No+Image';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                    {offer.createdBy && (
                      <div className="text-xs text-gray-500">
                        Created by: {offer.createdBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.activityTitle ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{offer.activityTitle}</div>
                        {offer.selectedPackages && offer.selectedPackages.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {offer.selectedPackages.length} package{offer.selectedPackages.length > 1 ? 's' : ''} selected
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.discount || offer.discountPercentage ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {offer.discount || `${offer.discountPercentage}% OFF`}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      offer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditOffer(offer)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Offer"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Offer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;
