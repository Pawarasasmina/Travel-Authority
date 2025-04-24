
import React from 'react';
import offer1 from '../../assets/home-images/offers/offer1.png';
import offer2 from '../../assets/home-images/offers/offer2.png';
import offer3 from '../../assets/home-images/offers/offer3.png';
import offer4 from '../../assets/home-images/offers/offer4.png';
import offer5 from '../../assets/home-images/offers/offer5.png';

interface OfferCardProps {
  image: string;
  title: string;
  discount?: string;
  className?: string;
}

const OfferCard: React.FC<OfferCardProps> = ({ image, title, discount, className }) => {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-lg ${className} group animate-zoom-in`}>
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
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
  const offerImages = [offer1, offer2, offer3, offer4,offer5,];

  return (
    <section className="py-12 max-w-8xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <OfferCard 

          image={offerImages[0]} 
          title=" Womens Day Offers" 
          discount="50% OFF"
          className="md:h-64"
        />
        <OfferCard 
          image={offerImages[1]} 
          title="SPECIAL OFFER" 
          className="md:h-64"
        />
        <OfferCard 
          image={offerImages[2]} 
          title="SPECIAL OFFERS HOLIDAY PACKAGES" 
          discount="30% off!" 
          className="md:h-64"
        />
        <OfferCard 
          image={offerImages[3]} 
          title="Travel TIME" 
          className="md:h-64"
        />
        <OfferCard 
          image={offerImages[4]} 
          title="Travel TIME" 
          className="md:h-64"
        />  
      </div>
    </section>
  );
};

export default SpecialOffers;