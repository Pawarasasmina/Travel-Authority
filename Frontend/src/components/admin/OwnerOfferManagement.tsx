import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Trash2, Edit, Eye, X, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as offerApi from '../../api/offerApi';
import { debugLog } from '../../utils/debug';
import OfferForm from './OfferForm';

interface OwnerOffer {
  id?: number;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  activityId: number;
  activityTitle?: string;
  active?: boolean;
  createdBy?: string;
}

const OwnerOfferManagement: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OwnerOffer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OwnerOffer | null>(null);

  useEffect(() => {
    if (user && user.email) {
      fetchOffers(user.email);
    }
  }, [refreshKey, user]);

  const fetchOffers = async (email: string) => {
    try {
      setLoading(true);
      debugLog('OWNER_OFFERS', 'Fetching owner offers');

      // Call the API to get offers for the owner
      const response = await offerApi.getOffersByOwner(email);
      if (response && Array.isArray(response)) {
        setOffers(response);
        debugLog('OWNER_OFFERS', 'Offers loaded', response);
      } else {
        setError('Failed to load offers: Invalid response format');
        debugLog('OWNER_OFFERS', 'Invalid offers response', response);
      }
    } catch (err: any) {
      debugLog('OWNER_OFFERS', 'Error fetching offers', err);
      setError('Error loading offers: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddOffer = () => {
    setSelectedOffer(null);
    setShowForm(true);
  };

  const handleEditOffer = (offer: OwnerOffer) => {
    setSelectedOffer(offer);
    setShowForm(true);
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedOffer(null);
  };

  const handleSaveOffer = async (offerData: any) => {
    try {
      debugLog('OWNER_OFFERS', 'Processing save offer request', { 
        id: offerData.id, 
        title: offerData.title
      });
      
      // Make sure to set the creator to the current user's email
      if (user && user.email) {
        offerData.createdBy = user.email;
      }
      
      const response = await offerApi.saveOffer(offerData);
      
      if (response.status === 'OK' || response.status === '200 OK' || response.status === 'CREATED' || 
          response.status === '201 CREATED' || response.success === true) {
        debugLog('OWNER_OFFERS', 'Offer saved successfully', response.data);
        setShowForm(false);
        setSuccessMessage(`Offer "${offerData.title}" saved successfully!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setRefreshKey(prevKey => prevKey + 1);
      } else {
        debugLog('OWNER_OFFERS', 'Failed to save offer', response);
        setError(response.message || 'Failed to save offer');
      }
    } catch (err: any) {
      debugLog('OWNER_OFFERS', 'Error saving offer', err);
      setError('Failed to save offer: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredOffers = offers.filter(offer => {
    return (
      offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.activityTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (offer: OwnerOffer) => {
    if (!offer.id) {
      alert('Cannot delete offer: Missing ID');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${offer.title}"?`)) {
      return;
    }
    
    try {
      setDeleteInProgress(offer.id.toString());
      const response = await offerApi.deleteOffer(offer.id);
      
      if (response.success || response.status === 'OK' || response.status === '200 OK' || response.status === 'NO_CONTENT') {
        setSuccessMessage(`Offer "${offer.title}" deleted successfully`);
        setRefreshKey(prevKey => prevKey + 1); // Trigger reload of offers
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        alert(`Failed to delete offer: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error deleting offer: ${err.message || 'Unknown error'}`);
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && offers.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && offers.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (showForm) {
    return <OfferForm offer={selectedOffer} onSave={handleSaveOffer} onCancel={handleCancelForm} />;
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
          <Package size={24} className="mr-2" />
          My Offers
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            onClick={handleAddOffer}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
          <p className="text-gray-500 mb-6">You don't have any special offers set up yet. Please create activities first, then you can create offers.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Offer</th>
                <th className="py-3 px-4 text-left">Activity</th>
                <th className="py-3 px-4 text-left">Discount</th>
                <th className="py-3 px-4 text-left">Duration</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOffers.map(offer => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{offer.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {offer.description?.substring(0, 60)}
                      {offer.description && offer.description.length > 60 ? '...' : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {offer.activityTitle || 'Unknown Activity'}
                  </td>
                  <td className="py-3 px-4">
                    {offer.discountPercentage}%
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      offer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.active ? (
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
                        onClick={() => handleEditOffer(offer)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(offer)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                        disabled={deleteInProgress === offer.id?.toString()}
                      >
                        {deleteInProgress === offer.id?.toString() ? (
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
    </div>
  );
};

export default OwnerOfferManagement;
