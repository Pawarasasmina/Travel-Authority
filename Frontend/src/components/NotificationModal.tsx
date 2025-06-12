import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import offer from "../assets/offers/offer1.jpg";
import offer2 from "../assets/offers/offer2.jpg";
import offer3 from "../assets/offers/offer3.jpg";

// Sample notification data
const todayNotifications = [
  {
    id: 1,
    title: "Special Offers",
    description: "20% discount from travel packages.",
    time: "2 hours ago",
    icon: offer,
  },
  {
    id: 2,
    title: "Tour Travels",
    description: "New exciting destinations are waiting for you.",
    time: "4 hours ago",
    icon: offer2,
  },
  {
    id: 3,
    title: "Southern Travels",
    description: "Special deal for Galle Camp planners.",
    time: "5 hours ago",
    icon: offer3,
  },
  {
    id: 4,
    title: "Soda Tura Sri Lanka",
    description: "Explore the beautiful east of Sri Lanka.",
    time: "6 hours ago",
    icon: offer,
  },
];

const yesterdayNotifications = [
  {
    id: 5,
    title: "Special Offers",
    description: "Limited spots left for New Year's Eve special packages.",
    time: "1 day ago",
    icon: offer3,
  },
  {
    id: 6,
    title: "Southern Travels",
    description: "New destinations added to camping plans.",
    time: "1 day ago",
    icon: offer2,
  },
  {
    id: 7,
    title: "Sigma Tour Sri Lanka",
    description: "Sign up for our newsletter to receive special offers.",
    time: "1 day ago",
    icon: offer ,
  },
  {
    id: 8,
    title: "Southern Travels",
    description: "Upcoming events for Eastern Camp planners.",
    time: "1 day ago",
    icon: offer3,
  },
];

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackdropClick}
      />
      
      <div className="fixed md:absolute top-0 md:top-12 right-0 w-full md:w-[350px] h-full md:h-auto bg-white md:rounded-lg shadow-xl overflow-hidden z-50">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 md:p-3 border-b flex justify-between items-center bg-white">
          <h3 className="font-semibold text-gray-800 text-lg md:text-base">Notifications</h3>
          <button onClick={onClose} className="p-2 md:p-0 hover:bg-gray-100 md:hover:bg-transparent rounded-full md:rounded-none">
            <X size={20} className="md:size-[18px]" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-60px)] md:max-h-[400px] overflow-y-auto">
          {/* Today's notifications */}
          <div className="p-4 md:p-3 border-b">
            <h4 className="text-orange-400 font-semibold mb-3 md:mb-2 text-sm">Today</h4>
            <div className="space-y-4 md:space-y-3">
              {todayNotifications.map((notification) => (
                <div key={notification.id} className="flex gap-4 md:gap-3 cursor-pointer hover:bg-gray-50 p-3 md:p-2 rounded-lg md:rounded">
                  <img 
                    src={notification.icon} 
                    alt={notification.title} 
                    className="w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h5 className="font-medium text-base md:text-sm truncate">{notification.title}</h5>
                      <span className="text-gray-400 text-sm md:text-xs whitespace-nowrap ml-2">{notification.time}</span>
                    </div>
                    <p className="text-sm md:text-xs text-gray-600 line-clamp-2">{notification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday's notifications - same structure as Today's */}
          <div className="p-4 md:p-3 border-b">
            <h4 className="text-orange-400 font-semibold mb-3 md:mb-2 text-sm">Yesterday</h4>
            <div className="space-y-4 md:space-y-3">
              {yesterdayNotifications.map((notification) => (
                <div key={notification.id} className="flex gap-4 md:gap-3 cursor-pointer hover:bg-gray-50 p-3 md:p-2 rounded-lg md:rounded">
                  <img 
                    src={notification.icon} 
                    alt={notification.title} 
                    className="w-12 h-12 md:w-10 md:h-10 rounded-lg md:rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h5 className="font-medium text-base md:text-sm truncate">{notification.title}</h5>
                      <span className="text-gray-400 text-sm md:text-xs whitespace-nowrap ml-2">{notification.time}</span>
                    </div>
                    <p className="text-sm md:text-xs text-gray-600 line-clamp-2">{notification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View all button */}
          <div className="sticky bottom-0 p-4 md:p-3 bg-white border-t">
            <button 
              onClick={handleViewAll}
              className="w-full py-3 md:py-2 bg-orange-50 text-orange-500 rounded-lg font-medium hover:bg-orange-100 transition-colors"
            >
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
