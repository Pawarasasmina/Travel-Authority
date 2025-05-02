import React from 'react';

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  onClick?: () => void;
}

const CardComponent: React.FC<CardProps> = ({ title, description, imageUrl, onClick }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="h-48 bg-gray-200 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button 
          onClick={onClick}
          className="text-teal-600 font-semibold hover:text-teal-800 transition-colors duration-300"
        >
          Explore More →
        </button>
      </div>
    </div>
  );
};

export default CardComponent;
