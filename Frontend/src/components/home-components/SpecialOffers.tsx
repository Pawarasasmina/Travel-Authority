import React, { useState, useEffect } from 'react';
import { getActiveOffers } from '../../api/offerApi';
import { debugLog } from '../../utils/debug';
// Fallback images in case API doesn't return any offers
import offer1 from '../../assets/home-images/offers/offer1.png';
import offer2 from '../../assets/home-images/offers/offer2.png';
import offer3 from '../../assets/home-images/offers/offer3.png';

interface OfferCardProps {
  image: string;
  title: string;
  discount?: string;
  className?: string;
}

interface Offer {
  id: number;
  title: string;
  image: string;
  discount?: string;
  active: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ image, title, discount, className }) => {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-lg ${className} group animate-zoom-in`}>
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          // Use a default image if the image fails to load
          e.currentTarget.src = offer1;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
        {discount && (
          <div className="text-white font-bold text-3xl mb-2">{discount}</div>
        )}
        <h3 className="text-white font-bold text-xl">{title}</h3>
      </div>
    </div>
  );
};

const SpecialOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  
  // Fallback images for when the API doesn't return offers
  const fallbackOffers = [
    {
      id: 1,
      title: "Special Offer 1",
      image: offer1,
      discount: "30% OFF",
      active: true
    },
    {
      id: 2,
      title: "Special Offer 2",
      image: offer2,
      active: true
    },
    {
      id: 3,
      title: "Special Offer 3",
      image: offer3,
      discount: "20% OFF",
      active: true
    },
  ];
  
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await getActiveOffers();
        
        if (response.status === 'OK' || response.status === '200 OK' || response.success === true) {
          if (response.data && response.data.length > 0) {
            debugLog('OFFERS', 'Loaded offers from API', response.data);
            setOffers(response.data);
          } else {
            // No offers returned from API, use fallbacks
            debugLog('OFFERS', 'No offers returned from API, using fallbacks');
            setOffers(fallbackOffers);
          }
        } else {
          // API error, use fallbacks
          debugLog('OFFERS', 'API error, using fallbacks', response);
          setOffers(fallbackOffers);
          setError(true);
        }
      } catch (err) {
        // Exception, use fallbacks
        debugLog('OFFERS', 'Exception fetching offers, using fallbacks', err);
        setOffers(fallbackOffers);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, []);
  
  // If there are no offers and we're not loading, don't render anything
  if (!loading && offers.length === 0) {
    return null;
  }
  
  // Use the offers from the API or fallbacks
  const displayOffers = offers;
  
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="relative w-full">
        {loading ? (
          // Skeleton loading UI
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="inline-block w-1/4 flex-shrink-0 px-2">
                <div className="h-[300px] w-full bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex whitespace-nowrap animate-infinite-scroll">
            {/* First set */}
            {offers.map((offer) => (
              <div 
                key={`original-${offer.id}`} 
                className="inline-block w-1/4 flex-shrink-0 px-2"
              >
                <OfferCard 
                  image={offer.image}
                  title={offer.title}
                  discount={offer.discount}
                  className="h-[300px] w-full"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {offers.map((offer) => (
              <div 
                key={`duplicate-${offer.id}`} 
                className="inline-block w-1/4 flex-shrink-0 px-2"
              >
                <OfferCard 
                  image={offer.image}
                  title={offer.title}
                  discount={offer.discount}
                  className="h-[300px] w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default SpecialOffers;