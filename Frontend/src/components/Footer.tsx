import React from "react";
import { Twitter, Instagram, Facebook } from "lucide-react";
import bg from "../assets/footerbg.png";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="text-white bg-cover bg-center py-10 px-6" style={{ backgroundImage: `url(${bg})` }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        {/* Left Section: Logo and Branding */}
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="Logo" className="w-20 h-20 object-contain mx-auto" />
          <div className="text-2xl font-extrabold tracking-widest text-center">
            <span className="text-white">TRA</span>
            <span className="text-orange-400">V</span>
            <span className="text-white">EL.LK</span>
          </div>
        </div>

        {/* Center Section: Tagline and Social Icons */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-80 text-xl" >
            "Your gateway to unforgettable travel experiences. Let's make your next adventure unforgettable!"
          </p>
          <div className="flex gap-6">
            <a href="#"><Twitter className="w-6 h-6" /></a>
            <a href="#"><Instagram className="w-6 h-6" /></a>
            <a href="#"><Facebook className="w-6 h-6" /></a>
          </div>
        </div>

        {/* Right Section: Navigation Links */}
        <ul className="flex flex-col items-center md:items-start space-y-2 text-sm">
          <li><a href="#" className="hover:underline">HOME</a></li>
          <li><a href="#" className="hover:underline">CATEGORIES</a></li>
          <li><a href="#" className="hover:underline">PURCHASE LIST</a></li>
          <li><a href="#" className="hover:underline">ABOUT US & CONTACT</a></li>
        </ul>
      </div>
    </footer>
  );
}
