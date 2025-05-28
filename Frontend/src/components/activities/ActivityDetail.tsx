import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchActivityById } from '../../api/activityApi';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState('standard');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchActivityById(Number(id))
      .then((data) => {
        setActivity(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Activity not found');
        setLoading(false);
      });
  }, [id]);

  // Helper to get numeric price
  const getBasePrice = () => {
    if (!activity) return 0;
    if (typeof activity.price === 'number') return activity.price;
    if (typeof activity.price === 'string') {
      const parsed = parseInt(activity.price.replace(/[^\d]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Get the price based on selected package
  const getSelectedPrice = () => {
    if (!activity) return 'LKR 0';
    const basePrice = getBasePrice();
    switch(selectedPackage) {
      case 'premium':
        return `LKR ${basePrice + 1500}`;
      case 'family':
        return `LKR ${basePrice * 3}`;
      default:
        return `LKR ${basePrice}`;
    }
  };

  // Handle booking button click
  const handleBookNow = (packageType: string) => {
    if (!activity) return;
    navigate(`/booking/people-count`, {
      state: {
        activityId: activity.id,
        activityTitle: activity.title,
        location: activity.location,
        packageType,
        basePrice: getBasePrice(),
        image: activity.image,
        description: activity.description
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (error || !activity) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || 'Activity not found'}</h1>
        <Link to="/" className="text-blue-500 hover:underline">Return to homepage</Link>
      </div>
    );
  }

  return (
    <div className="activity-detail">
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-96 bg-cover bg-center pt-[52px]" 
        style={{backgroundImage: `url(${activity.image})`}}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl font-bold mb-2">{activity.title}</h1>
            <p className="text-xl">{activity.location}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Content (60%) */}
          <div className="lg:w-3/5">
            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Activity</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{activity.description}</p>
            </div>
            
            {/* Decorative Element */}
            <div className="flex my-8">
              <div className="h-1 bg-orange-200 flex-grow my-auto mx-4"></div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="h-1 bg-orange-200 flex-grow my-auto mx-4"></div>
            </div>

            {/* Highlights Section */}
            <div className="bg-white shadow-md rounded-lg p-6 my-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Tour Includes:</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activity.highlights && Array.isArray(activity.highlights) && activity.highlights.length > 0) ? (
                  activity.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{highlight}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 italic">No highlights available.</li>
                )}
              </ul>
            </div>
            
            {/* Additional Information Section - Can add more content here */}
            <div className="bg-gray-50 rounded-lg p-6 my-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Additional Information</h2>
              <p className="text-gray-700">This activity is perfect for adventure seekers and nature lovers alike. Bring comfortable clothes and get ready for an unforgettable experience in Sri Lanka.</p>
            </div>
          </div>

          {/* Right Column - Booking (40%) */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sticky top-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{activity.title}</h3>
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Duration: {activity.duration || '3-4 hours'}</span>
                </div>
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{activity.location}</span>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Price per person</span>
                  <span className="text-xl font-bold text-orange-600">{getSelectedPrice()}</span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm text-gray-500">
                    {selectedPackage === 'standard' ? 'Standard Package' : 
                     selectedPackage === 'premium' ? 'Premium Package' : 'Family Package'}
                  </span>
                </div>
              </div>
              
              {/* Package Options - Card Style */}
              <div className="my-6">
                <h4 className="font-medium text-gray-700 mb-4">Available Packages:</h4>
                
                <div className="space-y-4">
                  {/* Standard Package Card */}
                  <div 
                    onClick={() => setSelectedPackage('standard')}
                    className={`bg-white rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      selectedPackage === 'standard' 
                        ? 'border-orange-500 shadow-md ring-2 ring-orange-200' 
                        : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex">
                      <div className={`p-4 flex-1 ${selectedPackage === 'standard' ? 'bg-orange-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">Standard Tour</h3>
                          <span className="text-orange-500 font-bold">{getSelectedPrice()}</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 mb-3">
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Standard transport to/from location</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Step-by-step guide with expert</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>All necessary equipment</span>
                          </li>
                        </ul>
                        <button 
                          className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-4 rounded-full text-sm font-medium transition-colors"
                          onClick={() => handleBookNow('standard')}
                        >
                          Book Now
                        </button>
                      </div>
                      <div className="hidden sm:block w-24 bg-cover bg-center" style={{backgroundImage: `url(${activity.image})`}}></div>
                    </div>
                  </div>
                  
                  {/* Premium Package Card */}
                  <div 
                    onClick={() => setSelectedPackage('premium')}
                    className={`bg-white rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      selectedPackage === 'premium' 
                        ? 'border-orange-500 shadow-md ring-2 ring-orange-200' 
                        : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex">
                      <div className={`p-4 flex-1 ${selectedPackage === 'premium' ? 'bg-orange-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">Premium Tour</h3>
                          <span className="text-orange-500 font-bold">LKR {getBasePrice() + 1500}</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 mb-3">
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Premium transport with refreshments</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Small group with personalized guide</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Lunch and refreshments included</span>
                          </li>
                        </ul>
                        <button 
                          className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-4 rounded-full text-sm font-medium transition-colors"
                          onClick={() => handleBookNow('premium')}
                        >
                          Book Now
                        </button>
                      </div>
                      <div className="hidden sm:block w-24 bg-cover bg-center" style={{backgroundImage: `url(${activity.image})`}}></div>
                    </div>
                  </div>
                  
                  {/* Family Package Card */}
                  <div 
                    onClick={() => setSelectedPackage('family')}
                    className={`bg-white rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      selectedPackage === 'family' 
                        ? 'border-orange-500 shadow-md ring-2 ring-orange-200' 
                        : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex">
                      <div className={`p-4 flex-1 ${selectedPackage === 'family' ? 'bg-orange-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">Family Package</h3>
                          <span className="text-orange-500 font-bold">LKR {getBasePrice() * 3}</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 mb-3">
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Family-friendly activities and pace</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Group discount (up to 4 people)</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-4 w-4 text-orange-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Souvenir photos included</span>
                          </li>
                        </ul>
                        <button 
                          className="bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-4 rounded-full text-sm font-medium transition-colors"
                          onClick={() => handleBookNow('family')}
                        >
                          Book Now
                        </button>
                      </div>
                      <div className="hidden sm:block w-24 bg-cover bg-center" style={{backgroundImage: `url(${activity.image})`}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                {/* We can remove this button since we have Book Now buttons on each card */}
                <button className="w-full mt-3 bg-white hover:bg-gray-100 text-orange-500 border border-orange-500 py-3 px-4 rounded-lg font-bold transition-colors">
                  Contact Tour Guide
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Secure payment guaranteed</p>
                <div className="flex justify-center mt-2">
                  <svg className="h-8 w-8 mx-1 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                  <svg className="h-8 w-8 mx-1 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V8h16v9c0 .55-.45 1-1 1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
