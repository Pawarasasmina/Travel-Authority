import React, { useState } from "react";
// Import images from home components
import image1 from '../assets/home-images/event-images/1.jpg';
import image2 from '../assets/home-images/event-images/2.jpg';
import image3 from '../assets/home-images/event-images/3.jpg';
import image4 from '../assets/home-images/event-images/4.jpg';
import image5 from '../assets/home-images/event-images/5.jpg';
import image6 from '../assets/home-images/event-images/6.jpg';
import PurchaseCard, { PurchaseItem } from '../components/ui/PurchaseCard';

// Mock data for purchase history
const purchaseData: PurchaseItem[] = [
  {
    id: "PUR-001",
    title: "White Water Rafting",
    location: "Kitulgala",
    image: image1,
    date: "2024-05-15",
    status: "Confirmed",
    price: 4500,
    persons: 2
  },
  {
    id: "PUR-002",
    title: "Uva Tea Factory Tour",
    location: "Haputale",
    image: image2,
    date: "2024-06-20",
    status: "Pending",
    price: 3200,
    persons: 1
  },
  {
    id: "PUR-003",
    title: "Birds Safari Tour",
    location: "Bundala",
    image: image3,
    date: "2024-04-10",
    status: "Completed",
    price: 5000,
    persons: 4
  },
  {
    id: "PUR-004",
    title: "Flying Ravana",
    location: "Ella",
    image: image4,
    date: "2024-07-05",
    status: "Confirmed",
    price: 6500,
    persons: 2
  },
  {
    id: "PUR-005",
    title: "Dolphin Watching",
    location: "Kalpitiya",
    image: image5,
    date: "2024-05-30",
    status: "Pending",
    price: 8000,
    persons: 3
  },
  {
    id: "PUR-006",
    title: "Paramotoring",
    location: "Bentota",
    image: image6,
    date: "2024-08-12",
    status: "Cancelled",
    price: 7500,
    persons: 1
  }
];

const PurchaseList = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Filter purchases based on selected filter
  const filteredPurchases = selectedFilter === "all" 
    ? purchaseData 
    : purchaseData.filter(purchase => purchase.status.toLowerCase() === selectedFilter.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col mt-8">
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-6">My Purchases</h1>
          <p className="text-lg mb-8">View and manage all your booked travel experiences.</p>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map((filter) => (
              <button 
                key={filter}
                onClick={() => setSelectedFilter(filter.toLowerCase())} 
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedFilter === filter.toLowerCase() 
                    ? 'bg-gradient-to-r from-[#FF7F50] to-[#BF360C] text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          {/* Purchases List */}
          <div className="space-y-6">
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xl">No purchases found for the selected filter.</p>
              </div>
            ) : (
              filteredPurchases.map(purchase => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseList;
