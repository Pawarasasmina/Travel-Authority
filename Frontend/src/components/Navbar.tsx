import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import navbarBg from "../assets/navbar/navbar_bg.png";
import { Bell, User, LogOut } from "lucide-react";
import NotificationModal from "./NotificationModal";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrolled = currentScrollPos > 500;
      
      // Show/hide navbar based on scroll direction
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-40"
      style={{
        minHeight: '52px',
        backgroundImage: transparent 
          ? (scrolled ? 'none' : 'none')
          : `url(${navbarBg})`,
        backgroundColor: transparent && scrolled 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'transparent',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'all 0.3s ease',
        transform: `translateY(${visible ? '0' : '-100%'})`,
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
        {/* Hide navigation links for admin and travel activity owner */}
        {(!user?.role || (user.role !== 'ADMIN' && user.role !== 'TRAVEL_ACTIVITY_OWNER')) && (
          <div className="hidden md:flex gap-9 items-center">
            <NavLink 
              to="/home" 
              className={({ isActive }) => 
                `text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition relative
                ${isActive ? 'after:content-[""] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-orange-400' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/categories" 
              className={({ isActive }) => 
                `text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition relative
                ${isActive ? 'after:content-[""] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-orange-400' : ''}`
              }
            >
              Categories
            </NavLink>
            <NavLink 
              to="/purchase-list" 
              className={({ isActive }) => 
                `text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition relative
                ${isActive ? 'after:content-[""] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-orange-400' : ''}`
              }
            >
              Purchase List
            </NavLink>
          </div>
        )}
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
          </div>          <button 
            className="text-white hover:text-orange-400 transition" 
            aria-label="User"
            onClick={() => navigate('/profile')}
          >
            <User size={22} />
          </button>
          
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-white text-xs hidden md:block">
                {user?.firstName}
              </span>
              
             
              
          
              
              <button 
                className="text-white hover:text-red-400 transition" 
                aria-label="Logout"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;