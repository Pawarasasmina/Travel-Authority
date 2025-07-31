import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOfferById } from '../api/offerApi';
import { X } from 'lucide-react';
import Button from '../components/ui/Button'; // Add this import

const OfferDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOfferById(Number(id));
        if (response.status === 'OK' || response.status === '200 OK') {
          setOffer(response.data);
        } else {
          setError(response.message || 'Offer not found');
        }
      } catch (err: any) {
        setError('Failed to load offer');
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <X className="w-8 h-8 text-red-500 mb-2" />
        <div className="text-red-600">{error}</div>
        <Link to="/" className="mt-4">
          <Button variant="primary" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }
  if (!offer) return null;

  return (
   <div className="pt-10 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
     <button
          onClick={() => window.history.back()}
          className="mb-4 flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow mt-10 mb-10">
      <img src={offer.image} alt={offer.title} className="w-full h-64 object-cover rounded mb-4" />
      <h1 className="text-2xl font-bold mb-2">{offer.title}</h1>
     
      {offer.discountPercentage && (
        <div className="text-green-600 font-semibold text-lg mb-2">{offer.discountPercentage}% OFF</div>
      )}
      <div className="mb-2">
        <span className="font-semibold">Activity:</span> {offer.activityTitle || 'N/A'}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Duration:</span> {offer.startDate} - {offer.endDate}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> {offer.active ? 'Active' : 'Inactive'}
      </div>
      {offer.description && (
        <div className="mb-2">
          <span className="font-semibold">Description:</span> {offer.description}
        </div>
      )}
      <Link to="/" className="inline-block mt-4 w-full">
        <Button variant="primary" className="w-full">
          Back to Home
        </Button>
      </Link>
    </div>
    </div>
    </div>
  );
};

export default OfferDetails;
