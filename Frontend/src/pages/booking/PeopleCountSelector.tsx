import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useAlert } from '../../contexts/AlertContext';
import PaymentModal from '../../components/PaymentModal';

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
  const { showAlert, showConfirm } = useAlert();
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
  
  // Add state for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
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
  const handleContinue = async () => {
    const totalPeople = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (totalPeople === 0) {
      await showAlert("Please select at least one person", "Selection Required");
      return;
    }
    
    if (!selectedDate) {
      await showAlert("Please select a date for your booking", "Date Required");
      return;
    }
    
    // Show payment modal instead of confirmation
    setShowPaymentModal(true);
  };

  // Handle payment confirmation
  const handlePaymentConfirm = async (bookingData: any) => {
    // Navigate to success page first
    navigate('/payment-success', {
      state: bookingData
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
    <div className="pt-[52px] max-w-5xl mx-auto px-4 py-6">
      {/* Activity Header - Compact Layout */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white rounded-lg shadow-sm p-4">
        {/* Image */}
        <div className="md:w-1/3">
          <div className="w-full h-[200px] rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt={activityTitle} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
        
        {/* Details */}
        <div className="md:w-2/3 space-y-3">
          <div>
            <h1 className="text-2xl font-bold">{activityTitle}</h1>
            <div className="flex items-center text-gray-600 mt-1">
              <svg className="h-4 w-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{activityLocation}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>3-4 hours</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>1-15 people</span>
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>English, Sinhala</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
            {description?.slice(0, 150)}...
          </p>

          <div className="flex items-center justify-between pt-2">
            <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
              {packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package
            </span>
            <div className="text-right">
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="text-lg font-bold text-orange-600">LKR {basePrice}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the booking interface */}
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

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={calculateTotal()}
        bookingDetails={{
          activityTitle,
          activityLocation,
          packageType,
          peopleCounts: counts,
          bookingDate: selectedDate,
          image
        }}
      />
    </div>
  );
};

export default PeopleCountSelector;
