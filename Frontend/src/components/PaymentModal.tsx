import React from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { X } from 'lucide-react';
import paymentImage from '../assets/payment/payment.png';
import visaIcon from '../assets/payment/visa.png';
import mastercardIcon from '../assets/payment/mastercard.png';
import jcbIcon from '../assets/payment/jcb.jpg';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
  totalAmount: string;
  bookingDetails: {
    activityId?: number;
    activityTitle: string;
    activityLocation: string;
    packageType: string;
    packageId?: number;
    peopleCounts: Record<string, number>;
    bookingDate: string;
    image: string;
    description?: string;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  totalAmount,
  bookingDetails 
}) => {
  // Calculate additional charges
  const baseAmount = parseFloat(totalAmount.replace(/[^\d.]/g, ''));
  const serviceFee = baseAmount * 0.05; // 5% service fee
  const tax = baseAmount * 0.15; // 15% tax
  const finalTotal = baseAmount + serviceFee + tax;

  const handlePayment = async () => {
    // Generate a ticket ID
    const ticketId = `TICK-${Date.now()}`;
    
    // Create booking data for API
    const bookingRequestData = {
      activityId: bookingDetails.activityId || 0,
      activityTitle: bookingDetails.activityTitle,
      activityLocation: bookingDetails.activityLocation,
      image: bookingDetails.image,
      description: bookingDetails.description || '',
      bookingDate: bookingDetails.bookingDate,
      packageId: bookingDetails.packageId,
      packageName: bookingDetails.packageType,
      basePrice: baseAmount,
      serviceFee: serviceFee,
      tax: tax,
      totalPrice: finalTotal,
      totalPersons: Object.values(bookingDetails.peopleCounts).reduce((a, b) => (a as number) + (b as number), 0) as number,
      paymentMethod: "Credit Card",
      peopleCounts: bookingDetails.peopleCounts
    };

    // Create booking data for frontend navigation
    const bookingData = {
      id: ticketId,
      title: bookingDetails.activityTitle,
      location: bookingDetails.activityLocation,
      image: bookingDetails.image,
      date: bookingDetails.bookingDate,
      status: "Pending",
      price: finalTotal,
      serviceFee,
      tax,
      persons: Object.values(bookingDetails.peopleCounts).reduce((a, b) => (a as number) + (b as number), 0) as number,
      bookingTime: new Date().toISOString(),
      paymentMethod: "Credit Card",
      packageType: bookingDetails.packageType,
      peopleCounts: bookingDetails.peopleCounts
    };

    try {
      // Call the booking API
      const { createBooking } = await import('../api/bookingApi');
      const response = await createBooking(bookingRequestData);
      
      if (response.success) {
        // Update the booking data with the actual ID from backend
        bookingData.id = response.data.id;
        
        // Navigate to success page
        onConfirm(bookingData);
      } else {
        // Handle API error
        console.error('Booking creation failed:', response.message);
        alert('Failed to create booking: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-6xl flex overflow-hidden scale-75">
          {/* Left side - Image */}
          <div className="w-3/5 relative hidden md:block">
            <img
              src={paymentImage}
              alt="Payment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-white text-center p-6">
                <h3 className="text-2xl font-bold mb-2">Secure Payment</h3>
                <p className="text-sm">Your transaction is protected by SSL encryption</p>
              </div>
            </div>
          </div>

          {/* Right side - Payment Form */}
          <div className="w-full md:w-2/5 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Receipt Summary</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {/* Receipt Details */}
            <div className="mb-6">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{bookingDetails.activityTitle}</span>
                <span>LKR {baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service Fee (5%)</span>
                <span>LKR {serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax (15%)</span>
                <span>LKR {tax.toFixed(2)}</span>
              </div>
              <div className="border-t mt-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span className="text-orange-500">LKR {finalTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  *All prices are in Sri Lankan Rupees (LKR)
                </p>
              </div>
            </div>

            {/* Payment Method Icons */}
            <div className="flex gap-4 mb-4 items-center">
              <img src={visaIcon} alt="Visa" className="h-8 object-contain" />
              <img src={mastercardIcon} alt="Mastercard" className="h-8 object-contain" />
              <img src={jcbIcon} alt="JCB" className="h-8 object-contain" />
              <span className="text-xs text-gray-500 ml-auto">Accepted cards</span>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <Input
                id="cardName"
                type="text"
                label="Name On Credit Card"
                placeholder="Name On Credit Card"
              />

              <Input
                id="cardNumber"
                type="text"
                label="Credit Card Number"
                placeholder="0000 0000 0000 0000"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="expiry"
                  type="text"
                  label="MM/YY"
                  placeholder="MM/YY"
                />
                <Input
                  id="cvv"
                  type="text"
                  label="CVV"
                  placeholder="CVV"
                />
              </div>

              <div className="text-xs text-gray-500 text-center my-4">
                Check Your Details Before The Payment
              </div>

              <Button
                onClick={handlePayment}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Book Tickets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
