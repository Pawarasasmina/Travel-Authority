import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

// Counter component for quantity selection
const QuantityCounter = ({ 
  label, 
  price, 
  count, 
  onChange 
}: { 
  label: string; 
  price: string; 
  count: number; 
  onChange: (count: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-gray-500">{price}</div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onChange(Math.max(0, count - 1))}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg"
          disabled={count === 0}
        >
          -
        </button>
        <span className="w-8 text-center">{count}</span>
        <button 
          onClick={() => onChange(count + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
};

const PeopleCountSelector = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    activityId, 
    activityTitle, 
    location: activityLocation, 
    packageType, 
    basePrice,
    image,
    description
  } = location.state || {};
  
  // Initialize people counts
  const [counts, setCounts] = useState({
    foreignAdult: 0,
    foreignKids: 0,
    localAdult: 0,
    localKids: 0
  });

  // Add state for selected date only
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Price calculation based on package and people type
  const getPriceForType = (type: string) => {
    const priceMap = {
      foreignAdult: packageType === 'premium' ? basePrice * 1.2 : basePrice,
      foreignKids: packageType === 'premium' ? basePrice * 0.8 : basePrice * 0.7,
      localAdult: packageType === 'premium' ? basePrice * 0.9 : basePrice * 0.75,
      localKids: packageType === 'premium' ? basePrice * 0.6 : basePrice * 0.5
    };
    
    return `LKR ${priceMap[type as keyof typeof priceMap]}`;
  };

  // Calculate total price
  const calculateTotal = () => {
    const prices = {
      foreignAdult: packageType === 'premium' ? basePrice * 1.2 : basePrice,
      foreignKids: packageType === 'premium' ? basePrice * 0.8 : basePrice * 0.7,
      localAdult: packageType === 'premium' ? basePrice * 0.9 : basePrice * 0.75,
      localKids: packageType === 'premium' ? basePrice * 0.6 : basePrice * 0.5
    };
    
    let total = 0;
    for (const type in counts) {
      total += prices[type as keyof typeof prices] * counts[type as keyof typeof counts];
    }
    
    return `LKR ${total.toFixed(2)}`;
  };

  // Handle count changes
  const handleCountChange = (type: string, value: number) => {
    setCounts(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Handle continue to payment
  const handleContinue = () => {
    const totalPeople = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (totalPeople === 0) {
      alert("Please select at least one person");
      return;
    }
    
    if (!selectedDate) {
      alert("Please select a date for your booking");
      return;
    }
    
    navigate('/booking/payment', {
      state: {
        activityId,
        activityTitle,
        activityLocation,
        packageType,
        peopleCounts: counts,
        totalPrice: calculateTotal(),
        image,
        bookingDate: selectedDate
      }
    });
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  if (!activityId || !basePrice) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          Missing activity information. Please go back and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[52px] max-w-6xl mx-auto px-4 py-8">
      {/* Activity Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-24 h-24 rounded-lg overflow-hidden">
          <img src={image} alt={activityTitle} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{activityTitle}</h1>
          <p className="text-gray-600">{activityLocation}</p>
          <div className="mt-1 text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded inline-block">
            {packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Activity Details</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700">About This Activity</h3>
              <p className="text-gray-600 text-sm mt-1">
                {description || "Experience this amazing adventure in one of Sri Lanka's most beautiful locations."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium text-gray-700">Duration</h3>
                <p className="text-gray-600 text-sm">Approximately 3-4 hours</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Group Size</h3>
                <p className="text-gray-600 text-sm">1-15 people</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Languages</h3>
                <p className="text-gray-600 text-sm">English, Sinhala</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Cancellation Policy</h3>
                <p className="text-gray-600 text-sm">Free cancellation up to 24 hours before</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 border-l pl-6">
            <h3 className="font-medium text-gray-700 mb-3">Package Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {packageType === 'standard' && (
                <>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Standard transport to/from location</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Group guide with expert</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>All necessary equipment</span>
                  </li>
                </>
              )}
              {packageType === 'premium' && (
                <>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Premium transport with refreshments</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Small group with personalized guide</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lunch and refreshments included</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Priority access at all locations</span>
                  </li>
                </>
              )}
              {packageType === 'family' && (
                <>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Family-friendly activities and pace</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Group discount (up to 4 people)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Souvenir photos included</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-4 w-4 text-green-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kid-friendly amenities available</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Section - Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* People Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Number of People</h2>
          
          <QuantityCounter
            label="Foreign Adult"
            price={getPriceForType('foreignAdult')}
            count={counts.foreignAdult}
            onChange={(value) => handleCountChange('foreignAdult', value)}
          />
          
          <QuantityCounter
            label="Foreign Kids"
            price={getPriceForType('foreignKids')}
            count={counts.foreignKids}
            onChange={(value) => handleCountChange('foreignKids', value)}
          />
          
          <QuantityCounter
            label="Local Adult"
            price={getPriceForType('localAdult')}
            count={counts.localAdult}
            onChange={(value) => handleCountChange('localAdult', value)}
          />
          
          <QuantityCounter
            label="Local Kids"
            price={getPriceForType('localKids')}
            count={counts.localKids}
            onChange={(value) => handleCountChange('localKids', value)}
          />
          
          <div className="mt-6">
            <div className="text-right mb-4">
              <div className="text-xl font-semibold">{calculateTotal()}</div>
            </div>
          </div>
        </div>
        
        {/* Date Selection - Simple Calendar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Date</h2>
          
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Booking Date</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            Note: Choose a date for your activity.
          </div>
          
          {/* Additional information */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-4">
            <h3 className="font-medium text-orange-800 mb-2">Important Information</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Activity starting time: 9:00 AM local time</li>
              <li>• Please arrive 15 minutes before start time</li>
              <li>• Bring comfortable clothing and sunscreen</li>
              <li>• Booking confirmation will be sent to your email</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" className="px-6" onClick={handleBack}>
          Back
        </Button>
        <Button className="px-10" onClick={handleContinue}>
          Check Out Now
        </Button>
      </div>
      
      <div className="text-xs text-center text-gray-500 mt-6">
        Note: Simply make changes to the people count to update the total price. 
        You can continue with your booking once you have selected the number of people and date.
      </div>
    </div>
  );
};

export default PeopleCountSelector;
