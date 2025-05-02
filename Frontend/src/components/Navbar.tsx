import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import navbarBg from "../assets/navbar/navbar_bg.png";
import { Bell, User } from "lucide-react";
import NotificationModal from "./NotificationModal";

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Get current scroll position
      const currentScrollPos = window.scrollY;
      
      // Set navbar visibility based on scroll direction
      // Also, always show navbar when at the top of the page
      setVisible(
        (prevScrollPos > currentScrollPos) || // Scrolling up
        currentScrollPos < 10 // At top of page
      );
      
      // Update previous scroll position
      setPrevScrollPos(currentScrollPos);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // CSS classes for navbar visibility
  const navbarVisibilityClass = visible 
    ? 'translate-y-0 opacity-100' 
    : '-translate-y-full opacity-0';

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ease-in-out ${navbarVisibilityClass} ${transparent ? 'fixed top-0 left-0' : 'relative'}`}
      style={{
        minHeight: '52px',
        backgroundImage: transparent ? 'none' : `url(${navbarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Navbar content */}
      <div className="relative flex items-center justify-between px-4 md:px-12 py-2 h-[52px]">
        <div className="flex items-center">
          <span className="text-white text-2xl font-extrabold tracking-widest">
            TRA<span className="text-orange-400">V</span>EL.LK
          </span>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex gap-9 items-center">
          <a href="/home" className="text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition">Home</a>
          <a href="/categories" className="text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition">Categories</a>
          <a href="/purchase-list" className="text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition">Purchase List</a>
        </div>
        <div className="flex items-center gap-4 ml-8">
          <div className="relative">
            <button 
              className="text-white hover:text-orange-400 transition" 
              aria-label="Notifications"
              onClick={toggleNotifications}
            >
              <Bell size={22} />
              {/* Optional: Notification indicator */}
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-white">3</span>
            </button>
            {showNotifications && <NotificationModal onClose={() => setShowNotifications(false)} />}
          </div>
          <button 
            className="text-white hover:text-orange-400 transition" 
            aria-label="User"
            onClick={() => navigate('/profile')}
          >
            <User size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;