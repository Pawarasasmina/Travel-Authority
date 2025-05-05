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
  const baseImages = [offer1, offer2, offer3, offer4, offer5];
  
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="relative w-full">
        <div className="flex animate-scroll">
          {/* First set of images */}
          {baseImages.map((image, index) => (
            <div 
              key={`first-${index}`} 
              className="w-1/4 flex-shrink-0 px-2"
            >
              <OfferCard 
                image={image}
                title={`Special Offer ${index + 1}`}
                discount={index % 3 === 0 ? "30% OFF" : undefined}
                className="h-[300px] w-full"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {baseImages.map((image, index) => (
            <div 
              key={`second-${index}`} 
              className="w-1/4 flex-shrink-0 px-2"
            >
              <OfferCard 
                image={image}
                title={`Special Offer ${index + 1}`}
                discount={index % 3 === 0 ? "30% OFF" : undefined}
                className="h-[300px] w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;