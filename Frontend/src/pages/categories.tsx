import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Categories = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Travel Categories</h1>
          <p className="text-lg mb-12">Explore our curated collection of travel experiences by category.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Beach Getaways', 'Mountain Adventures', 'Cultural Experiences', 'Wildlife Safaris', 
              'City Explorations', 'Food & Cuisine', 'Adventure Sports', 'Wellness Retreats', 'Historical Tours'].map((category, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{category}</h3>
                  <p className="text-gray-600 mb-4">Discover amazing {category.toLowerCase()} across Sri Lanka.</p>
                  <button className="text-teal-600 font-semibold hover:text-teal-800">
                    Explore More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Categories;