import React, { useEffect } from "react";
import { X } from "lucide-react";

// Sample notification data
const todayNotifications = [
  {
    id: 1,
    title: "Special Offers",
    description: "20% discount from travel packages.",
    time: "2 hours ago",
    icon: "https://via.placeholder.com/40",
  },
  {
    id: 2,
    title: "Tour Travels",
    description: "New exciting destinations are waiting for you.",
    time: "4 hours ago",
    icon: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    title: "Southern Travels",
    description: "Special deal for Galle Camp planners.",
    time: "5 hours ago",
    icon: "https://via.placeholder.com/40",
  },
  {
    id: 4,
    title: "Soda Tura Sri Lanka",
    description: "Explore the beautiful east of Sri Lanka.",
    time: "6 hours ago",
    icon: "https://via.placeholder.com/40",
  },
];

const yesterdayNotifications = [
  {
    id: 5,
    title: "Special Offers",
    description: "Limited spots left for New Year's Eve special packages.",
    time: "1 day ago",
    icon: "https://via.placeholder.com/40",
  },
  {
    id: 6,
    title: "Southern Travels",
    description: "New destinations added to camping plans.",
    time: "1 day ago",
    icon: "https://via.placeholder.com/40",
  },
  {
    id: 7,
    title: "Sigma Tour Sri Lanka",
    description: "Sign up for our newsletter to receive special offers.",
    time: "1 day ago",
    icon: "https://via.placeholder.com/40",
  },
  {
    id: 8,
    title: "Southern Travels",
    description: "Upcoming events for Eastern Camp planners.",
    time: "1 day ago",
    icon: "https://via.placeholder.com/40",
  },
];

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
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

  return (
    <>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackdropClick}
      />
      
      <div className="absolute top-12 right-0 w-[350px] bg-white rounded-lg shadow-xl overflow-hidden z-50">
        {/* Header with close button */}
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Notifications content with scrollable area */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Today's notifications */}
          <div className="p-3 border-b">
            <h4 className="text-orange-400 font-semibold mb-2 text-sm">Today</h4>
            <div className="space-y-3">
              {todayNotifications.map((notification) => (
                <div key={notification.id} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <img 
                    src={notification.icon} 
                    alt={notification.title} 
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h5 className="font-medium text-sm">{notification.title}</h5>
                      <span className="text-gray-400 text-xs">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-600">{notification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday's notifications */}
          <div className="p-3 border-b">
            <h4 className="text-orange-400 font-semibold mb-2 text-sm">Yesterday</h4>
            <div className="space-y-3">
              {yesterdayNotifications.map((notification) => (
                <div key={notification.id} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <img 
                    src={notification.icon} 
                    alt={notification.title} 
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h5 className="font-medium text-sm">{notification.title}</h5>
                      <span className="text-gray-400 text-xs">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-600">{notification.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View all link */}
          <div className="p-3 flex justify-center">
            <a href="#" className="text-orange-400 hover:text-orange-500 text-sm font-medium">
              View All
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
