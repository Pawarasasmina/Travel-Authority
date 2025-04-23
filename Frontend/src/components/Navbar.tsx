import React from "react";
import navbarBg from "../assets/navbar_bg.png";
import { Bell, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav
      className="relative w-full z-20"
      style={{
        minHeight: '52px',
        backgroundImage: `url(${navbarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background overlay */}
    

      {/* Navbar content */}
      <div className="relative flex items-center justify-between px-4 md:px-12 py-2 h-[52px]">
        <div className="flex items-center">
          <span className="text-white text-2xl font-extrabold tracking-widest">
            TRA<span className="text-orange-400">V</span>EL.LK
          </span>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex gap-9 items-center">
          <a href="#" className="text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition">Home</a>
          <a href="#" className="text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition">Categories</a>
          <a href="#" className="text-white uppercase text-xs font-semibold tracking-widest hover:text-orange-400 transition">Purchase List</a>
        </div>
        <div className="flex items-center gap-4 ml-8">
          <button className="text-white hover:text-orange-400 transition" aria-label="Notifications">
            <Bell size={22} />
          </button>
          <button className="text-white hover:text-orange-400 transition" aria-label="User">
            <User size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;