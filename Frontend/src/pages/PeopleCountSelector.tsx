import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAlert } from '../contexts/AlertContext';
import PaymentModal from '../components/PaymentModal';
import { checkAvailability } from '../api/activityApi';
import { checkPackageOffer } from '../api/offerApi';

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
  const { showAlert } = useAlert();
  const { 
    activityId, 
    activityTitle, 
    location: activityLocation, 
    packageName, 
    packageData, // Pass the full package object with pricing
    basePrice, // Keep for backward compatibility
    image,
    description
  } = location.state || {};
  
  // State for storing offer information
  const [offerInfo, setOfferInfo] = useState<{
    hasOffer: boolean;
    discountPercentage: number;
    offerTitle?: string;
  }>({
    hasOffer: false,
    discountPercentage: 0
  });

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
  
  // Add state for availability check
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<{
    available: boolean;
    bookedCount: number;
    totalAvailability: number;
    availableSpots: number;
    message?: string;
  } | null>(null);
  
  // Price calculation based on package data from database
  const getPriceForType = (type: string) => {
    if (packageData) {
      // Use real pricing from database
      const priceMap = {
        foreignAdult: packageData.foreignAdultPrice || packageData.price,
        foreignKids: packageData.foreignKidPrice || (packageData.price * 0.7),
        localAdult: packageData.localAdultPrice || (packageData.price * 0.75),
        localKids: packageData.localKidPrice || (packageData.price * 0.5)
      };
      return `LKR ${priceMap[type as keyof typeof priceMap]}`;
    } else {
      // Fallback to hardcoded multipliers if package data not available
      const priceMap = {
        foreignAdult: basePrice,
        foreignKids: basePrice * 0.7,
        localAdult: basePrice * 0.75,
        localKids: basePrice * 0.5
      };
      return `LKR ${priceMap[type as keyof typeof priceMap]}`;
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    let prices;
    
    if (packageData) {
      // Use real pricing from database
      prices = {
        foreignAdult: packageData.foreignAdultPrice || packageData.price,
        foreignKids: packageData.foreignKidPrice || (packageData.price * 0.7),
        localAdult: packageData.localAdultPrice || (packageData.price * 0.75),
        localKids: packageData.localKidPrice || (packageData.price * 0.5)
      };
    } else {
      // Fallback to hardcoded multipliers
      prices = {
        foreignAdult: basePrice,
        foreignKids: basePrice * 0.7,
        localAdult: basePrice * 0.75,
        localKids: basePrice * 0.5
      };
    }
    
    let total = 0;
    for (const type in counts) {
      total += prices[type as keyof typeof prices] * counts[type as keyof typeof counts];
    }
    
    // Apply discount if an offer exists
    if (offerInfo.hasOffer && offerInfo.discountPercentage > 0) {
      const discount = total * (offerInfo.discountPercentage / 100);
      total = total - discount;
    }
    
    return `LKR ${total.toFixed(2)}`;
  };

  // Check for package offers when component loads or when package changes
  useEffect(() => {
    const checkOffers = async () => {
      if (activityId && packageData?.id) {
        try {
          const offerResponse = await checkPackageOffer(activityId, packageData.id);
          setOfferInfo(offerResponse);
        } catch (error) {
          console.error("Error checking for offers:", error);
        }
      }
    };
    
    checkOffers();
  }, [activityId, packageData?.id]);

  // Check availability when date changes
  const checkDateAvailability = async (date: string) => {
    if (!date || !activityId) return;
    
    setIsCheckingAvailability(true);
    try {
      const response = await checkAvailability(activityId, packageData?.id, date);
      
      if (response.success) {
        setAvailabilityData(response.data);
        
        // Debug information
        console.log('Availability data:', response.data);
        
        // If the date is not available, show an alert
        if (!response.data.available) {
          await showAlert(
            response.data.message || 
            `This package is fully booked on this date. Maximum availability is ${response.data.totalAvailability} people and ${response.data.bookedCount} are already booked.`, 
            "Not Available"
          );
          setSelectedDate(''); // Reset the date
        }
      } else {
        throw new Error(response.message || "Failed to check availability");
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
      await showAlert(
        error.message || "There was an error checking date availability. Please try again.",
        "Error"
      );
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Note: Date change handler is directly in the onChange of the input

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
    
    // Check availability one more time before proceeding to payment
    try {
      setIsCheckingAvailability(true);
      const response = await checkAvailability(activityId, packageData?.id, selectedDate);
      
      if (response.success) {
        // Check if the requested number of people exceeds the available capacity
        if (!response.data.available || totalPeople > response.data.availableSpots) {
          await showAlert(
            `Sorry, this package only has ${response.data.availableSpots} spots available for this date. Please reduce the number of people or choose another date.`, 
            "Capacity Exceeded"
          );
          return;
        }
      } else {
        throw new Error(response.message || "Failed to check availability");
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
      await showAlert(
        error.message || "There was an error checking availability. Please try again.",
        "Error"
      );
      return;
    } finally {
      setIsCheckingAvailability(false);
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
              {packageName || 'Package'}
            </span>
            <div className="text-right">
              <div className="text-xs text-gray-500">Starting from</div>
              <div className="text-lg font-bold text-orange-600">LKR {basePrice}</div>
            </div>
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
              {offerInfo.hasOffer && offerInfo.discountPercentage > 0 && (
                <div className="text-green-600 text-sm font-medium mb-1">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                    {offerInfo.discountPercentage}% discount applied! {offerInfo.offerTitle && `(${offerInfo.offerTitle})`}
                  </span>
                </div>
              )}
              <div className="text-xl font-semibold">{calculateTotal()}</div>
            </div>
          </div>

          {/* Important Information - Moved here from date selection section */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-4">
            <h4 className="font-medium text-orange-800 mb-2">Important Information</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li className="flex items-start">
                <svg className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please arrive 15 minutes before
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                Bring comfortable clothing and sunscreen
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Booking confirmation will be sent to your email
              </li>
            </ul>
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
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                if (newDate) {
                  checkDateAvailability(newDate);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <div>Note: Choose a date for your activity.</div>
            {isCheckingAvailability && (
              <div className="flex items-center text-orange-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking availability...
              </div>
            )}
          </div>
          
          {availabilityData && selectedDate && availabilityData.available && (
            <div className={`p-3 rounded-md mb-6 ${
              availabilityData.availableSpots > 5
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}>
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${
                  availabilityData.availableSpots > 5
                    ? "text-green-500"
                    : "text-yellow-500"
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">
                    {availabilityData.availableSpots} spots available
                  </p>
                  <p className="text-sm">
                    {availabilityData.bookedCount} of {availabilityData.totalAvailability} already booked
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Package Features & Important Information */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-4">
            <h3 className="font-medium text-orange-800 mb-3">Package Features</h3>
            
            {/* Package Features */}
            {packageData?.features && packageData.features.length > 0 ? (
              <div className="mb-4">
                <ul className="text-sm text-orange-700 space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {packageData.features.map((feature: string, index: number) => {
                    // Helper function to get appropriate icon for each feature
                    const getFeatureIcon = (feature: string) => {
                      const lowerFeature = feature.toLowerCase();
                      if (lowerFeature.includes('transport') || lowerFeature.includes('vehicle') || lowerFeature.includes('transfer')) {
                        return (
                          <svg className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        );
                      } else if (lowerFeature.includes('meal') || lowerFeature.includes('food') || lowerFeature.includes('lunch') || lowerFeature.includes('breakfast')) {
                        return (
                          <svg className="h-4 w-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                          </svg>
                        );
                      } else if (lowerFeature.includes('guide') || lowerFeature.includes('instructor') || lowerFeature.includes('expert')) {
                        return (
                          <svg className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        );
                      } else if (lowerFeature.includes('accommodation') || lowerFeature.includes('hotel') || lowerFeature.includes('stay') || lowerFeature.includes('lodge')) {
                        return (
                          <svg className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        );
                      } else if (lowerFeature.includes('equipment') || lowerFeature.includes('gear') || lowerFeature.includes('tools')) {
                        return (
                          <svg className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        );
                      } else if (lowerFeature.includes('insurance') || lowerFeature.includes('safety') || lowerFeature.includes('protection')) {
                        return (
                          <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        );
                      } else {
                        // Default checkmark icon
                        return (
                          <svg className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        );
                      }
                    };

                    return (
                      <li key={index} className="flex items-start">
                        {getFeatureIcon(feature)}
                        <span className="text-green-800 font-medium">{feature}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-orange-200 my-3"></div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-orange-600 italic">Package features will be displayed here</p>
                <div className="border-t border-orange-200 my-3"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" className="px-6" onClick={handleBack}>
          Back
        </Button>
        <Button 
          className="px-10" 
          onClick={handleContinue} 
          disabled={isCheckingAvailability}
        >
          {isCheckingAvailability ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Check Out Now"
          )}
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
          activityId,
          activityTitle,
          activityLocation,
          packageType: packageName || 'Package',
          packageId: packageData?.id,
          peopleCounts: counts,
          bookingDate: selectedDate,
          image,
          description,
          hasDiscount: offerInfo.hasOffer,
          discountPercentage: offerInfo.discountPercentage,
          offerTitle: offerInfo.offerTitle
        }}
      />
    </div>
  );
};

export default PeopleCountSelector;
