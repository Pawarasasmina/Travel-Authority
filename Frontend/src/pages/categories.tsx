import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CardComponent from '../components/CardComponent';

const Categories = () => {
  // Category data with images
  const categoryData = [
    {
      title: 'Beach Getaways',
      description: 'Discover amazing beach getaways across Sri Lanka.',
      imageUrl: '/images/travel/beach-vacation.jpg'
    },
    {
      title: 'Mountain Adventures',
      description: 'Discover amazing mountain adventures across Sri Lanka.',
      imageUrl: '/images/travel/mountain-trek.jpg'
    },
    {
      title: 'Cultural Experiences',
      description: 'Discover amazing cultural experiences across Sri Lanka.',
      imageUrl: '/images/travel/cultural-heritage.jpg'
    },
    {
      title: 'Wildlife Safaris',
      description: 'Discover amazing wildlife safaris across Sri Lanka.',
      imageUrl: '/images/travel/wildlife-safari.jpg'
    },
    {
      title: 'City Explorations',
      description: 'Discover amazing city explorations across Sri Lanka.',
      imageUrl: '/images/travel/city-tour.jpg'
    },
    {
      title: 'Food & Cuisine',
      description: 'Discover amazing food & cuisine across Sri Lanka.',
      imageUrl: '/images/travel/local-cuisine.jpg'
    },
    {
      title: 'Adventure Sports',
      description: 'Discover amazing adventure sports across Sri Lanka.',
      imageUrl: '/images/travel/adventure-sports.jpg'
    },
    {
      title: 'Wellness Retreats',
      description: 'Discover amazing wellness retreats across Sri Lanka.',
      imageUrl: '/images/travel/wellness-spa.jpg'
    },
    {
      title: 'Historical Tours',
      description: 'Discover amazing historical tours across Sri Lanka.',
      imageUrl: '/images/travel/historical-ruins.jpg'
    }
  ];

  return (
   
     
      <div className="pt-24 flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Travel Categories</h1>
          <p className="text-lg mb-12">Explore our curated collection of travel experiences by category.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoryData.map((category, index) => (
              <CardComponent 
                key={index}
                title={category.title}
                description={category.description}
                imageUrl={category.imageUrl}
                onClick={() => console.log(`Exploring ${category.title}`)}
              />
            ))}
          </div>
        </div>
      </div>
     
   
  );
};

export default Categories;