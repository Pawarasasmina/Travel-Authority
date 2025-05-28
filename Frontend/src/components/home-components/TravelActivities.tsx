import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import image1 from '../../assets/home-images/event-images/1.jpg';
import image2 from '../../assets/home-images/event-images/2.jpg';
import image3 from '../../assets/home-images/event-images/3.jpg';
import image4 from '../../assets/home-images/event-images/4.jpg';
import image5 from '../../assets/home-images/event-images/5.jpg';
import image6 from '../../assets/home-images/event-images//6.jpg';
import image7 from '../../assets/home-images/event-images/7.jpg';
import image8 from '../../assets/home-images/event-images/8.jpg';
import image9 from '../../assets/home-images/event-images/9.jpg';
import image10 from '../../assets/home-images/event-images/10.jpg';
import image11 from '../../assets/home-images/event-images/11.jpg';
import image12 from '../../assets/home-images/event-images/12.jpg';
import image13 from '../../assets/home-images/event-images/13.jpg';
import image14 from '../../assets/home-images/event-images/14.jpg';
import image15 from '../../assets/home-images/event-images/15.jpg';
import image16 from '../../assets/home-images/event-images/16.jpg';
import { fetchAllActivities } from '../../api/activityApi';

// Define available categories
const CATEGORIES = [
  "Adventure",
  "Water Activities",
  "Cultural",
  "Wildlife",
  "Sightseeing"
];

// Map activities to categories
const ACTIVITY_CATEGORIES: { [key: number]: string[] } = {
  1: ["Adventure"], // White Water Rafting
  2: ["Cultural"], // Uva Tea Factory Tour
  3: ["Wildlife"], // Birds Safari Tour
  4: ["Adventure"], // Flying Ravana
  5: ["Water Activities"], // Dolphin Watching
  6: ["Adventure"], // Paramotoring
  7: ["Cultural"], // Forest Monastery
  8: ["Adventure"], // Hill Country Adventures
  9: ["Water Activities"], // Deep Sea Fishing
  10: ["Sightseeing"], // Nine Arches Bridge
  11: ["Cultural"], // Fort Frederick
  12: ["Water Activities"], // Jungle Beach
  13: ["Sightseeing"], // Galle Day Trip
  14: ["Wildlife"], // Wilpattu Park Safari
  15: ["Water Activities"], // Whale Watching
  16: ["Adventure"] // Cycle down to Hatton
};

interface ActivityCardProps {
  image: string;
  title: string;
  location: string;
  id: number;
  price: number;
  availability: number;
  rating: number;
  onClick: () => void;
  index: number; // Added index property
}

const ActivityCard: React.FC<ActivityCardProps> = ({ image, title, location, price, rating, onClick, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rowIndex = Math.floor(index / 4); // Calculate row for staggered animation

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }, rowIndex * 100); // Delay based on row position
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [rowIndex]);

  return (
    <div 
      ref={cardRef}
      className="rounded-lg overflow-hidden shadow-md group cursor-pointer hover:shadow-xl 
                 transition-all duration-700 opacity-0 translate-y-16"
      onClick={onClick}
      style={{
        transitionDelay: `${(index % 4) * 200}ms` // Stagger items within each row
      }}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-3 text-center">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500">{location}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm font-semibold text-green-600">${price}</span>
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="text-xs ml-1">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define SortOption type
type SortOption = 'default' | 'price-low' | 'price-high' | 'rating' | 'availability';

const TravelActivities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  interface Activity {
    id: number;
    title: string;
    location: string;
    price: number;
    availability: number;
    rating: number;
    // Add other fields if needed
  }
  
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleActivityClick = (id: number, title: string) => {
    const slugTitle = title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/activities/${id}/${slugTitle}`);
  };

  // Read category from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
      
      // Scroll to activities section
      const element = document.getElementById('travel-activities');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.search]);

  // Fetch activities from backend
  useEffect(() => {
    setLoading(true);
    fetchAllActivities()
      .then((data) => {
        setFilteredActivities(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load activities');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let sorted = [...filteredActivities];
    
    switch(sortOption) {
      case 'price-low':
        sorted = sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted = sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted = sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'availability':
        sorted = sorted.sort((a, b) => b.availability - a.availability);
        break;
      default:
        sorted = [...filteredActivities];
    }
    
    sorted = sorted.filter(activity => 
      activity.price >= priceRange[0] && 
      activity.price <= priceRange[1] &&
      activity.rating >= ratingFilter &&
      (selectedCategories.length === 0 || 
        ACTIVITY_CATEGORIES[activity.id].some(cat => selectedCategories.includes(cat)))
    );
    
    setFilteredActivities(sorted);
  }, [sortOption, priceRange, ratingFilter, selectedCategories]);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...priceRange] as [number, number];
    newRange[index] = newValue;
    setPriceRange(newRange);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };
  
  return (
    <section id="travel-activities" className="py-0 px-6 md:px-6 max-w-8xl relative mb-24">
      <h2 className="text-3xl font-bold text-center mb-10">Your Ultimate Travel Companion</h2>
      
      <div className="mb-0">
        <div className="flex flex-wrap justify-between items-start ">
          <div className="mb-2 md:mb-0">
            <label htmlFor="sort" className="text-sm font-medium">Sort by:</label>
            <select 
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="ml-2 border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-700 bg-white hover:border-gray-400 focus:border-gray-500"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="availability">Availability</option>
            </select>
            
          </div>
          {/* Activity Count Display */}
          <div className="text-center">
            <p className="text-sm text-green-800">
              <span className="font-medium">{filteredActivities.length}</span> 
              <span className="ml-1">
                {filteredActivities.length === 1 ? 'activity' : 'activities'} 
                {selectedCategories.length > 0 && ' in ' + selectedCategories.join(', ')}
              </span>
            </p>
          </div>
          <button 
            onClick={toggleFilters}
            className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-900 transition flex items-center space-x-2"
          >
            
            <span>Filters</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
        
        <div className="mt-3 mb-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    selectedCategories.includes(category)
                      ? 'bg-green-800 text-white border-green-800'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                  } transition-colors`}
                >
                  {category}
                </button>
              ))}
            </div>

            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="flex items-center px-2 py-0.5 text-xs bg-green-50 hover:bg-green-100 text-green-800 rounded-full border border-green-200 transition-colors duration-200 shadow-sm ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters ({selectedCategories.length})
              </button>
            )}
          </div>
          
          
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">Loading activities...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {filteredActivities.map((activity, index) => {
            // Map activity.id to the correct image import
            const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11, image12, image13, image14, image15, image16];
            const image = images[(activity.id - 1) % images.length];
            return (
              <ActivityCard 
                key={activity.id}
                {...activity}
                image={image}
                index={index}
                onClick={() => handleActivityClick(activity.id, activity.title)}
              />
            );
          })}
        </div>
      )}
      
      {/* Filter sidebar with adjusted z-index */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Filters</h3>
            <button onClick={toggleFilters} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Categories</h4>
            <div className="space-y-2">
              {CATEGORIES.map(category => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Price Range</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">${priceRange[0]}</span>
              <span className="text-sm font-semibold text-gray-700">${priceRange[1]}</span>
            </div>
            <div className="relative mt-2 mb-4">
              <div className="absolute inset-0 h-1 mt-3 bg-green-100 rounded"></div>
              <div 
                className="absolute h-1 mt-3 bg-green-800 rounded" 
                style={{ 
                  left: `${(priceRange[0] / 100) * 100}%`, 
                  width: `${((priceRange[1] - priceRange[0]) / 100) * 100}%` 
                }}
              ></div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={priceRange[0]} 
                onChange={(e) => handlePriceChange(e, 0)}
                className="absolute w-full h-1 mt-3 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
              />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={priceRange[1]} 
                onChange={(e) => handlePriceChange(e, 1)}
                className="absolute w-full h-1 mt-3 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>
            <div className="flex justify-between mt-6">
              <input 
                type="number" 
                min="0" 
                max={priceRange[1]} 
                value={priceRange[0]}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), priceRange[1]);
                  setPriceRange([value, priceRange[1]]);
                }}
                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="number" 
                min={priceRange[0]} 
                max="100" 
                value={priceRange[1]}
                onChange={(e) => {
                  const value = Math.max(Number(e.target.value), priceRange[0]);
                  setPriceRange([priceRange[0], value]);
                }}
                className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-3">Minimum Rating</h4>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          
          <button 
            onClick={() => {
              setPriceRange([0, 100]);
              setRatingFilter(0);
              setSortOption('default');
              setSelectedCategories([]);
            }}
            className="w-full bg-green-50 text-green-800 py-2 rounded-md hover:bg-green-100 transition mb-4"
          >
            Reset Filters
          </button>
          
          <button 
            onClick={toggleFilters}
            className="w-full bg-green-800 text-white py-2 rounded-md hover:bg-green-900 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleFilters}
        ></div>
      )}
    </section>
  );
};

export default TravelActivities;
