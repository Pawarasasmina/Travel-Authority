import { useNavigate } from 'react-router-dom';
import adventure from '../assets/categories/adventure.jpg';
import cultural from '../assets/categories/cultural.avif';
import water from '../assets/categories/water.jpg';
import wildlife from '../assets/categories/wildlife.jpg';
import sightseeing from '../assets/categories/sightseeing.jpg';

const Categories = () => {
  const navigate = useNavigate();
  
  // Match the 5 main categories from TravelActivities component
  const categoryData = [
    {
      title: 'Adventure',
      description: 'Experience thrilling activities like white water rafting, paramotoring, and mountain treks.',
      imageUrl: adventure,
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Water Activities',
      description: 'Enjoy exciting water experiences including dolphin watching, whale watching, and deep sea fishing.',
      imageUrl: water,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Cultural',
      description: 'Immerse yourself in Sri Lanka\'s rich heritage through temple visits, tea factory tours, and local traditions.',
      imageUrl: cultural,
      color: 'from-purple-500 to-fuchsia-600'
    },
    {
      title: 'Wildlife',
      description: 'Encounter Sri Lanka\'s amazing biodiversity with safari tours, bird watching, and nature expeditions.',
      imageUrl: wildlife,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Sightseeing',
      description: 'Discover stunning landscapes, historical sites, and picturesque locations across the island.',
      imageUrl: sightseeing,
      color: 'from-rose-500 to-pink-600'
    }
  ];

  // Handle category selection and navigation to home page
  const handleCategoryClick = (category: string) => {
    // Navigate to the home page with the selected category as a query parameter
    // and include an anchor to scroll to the activities section
    navigate(`/home?category=${encodeURIComponent(category)}#travel-activities`);
  };

  return (
    <div className="pt-24 flex-grow bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold mb-4 text-center">Travel Categories</h1>
        <p className="text-xl mb-12 text-center text-gray-600 max-w-3xl mx-auto">
          Explore Sri Lanka through our collection of travel experiences. Choose a category to begin your journey.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryData.map((category, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer group"
              onClick={() => handleCategoryClick(category.title)}
            >
              <div className="relative h-64">
                <img 
                  src={category.imageUrl} 
                  alt={category.title} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-70`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-3xl font-bold text-white text-center px-6">{category.title}</h2>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-700">{category.description}</p>
                <div className="mt-4 flex justify-end">
                  <span className="inline-flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Explore <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;