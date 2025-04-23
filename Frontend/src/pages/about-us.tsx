import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bg from "../assets/aboutusbg.png"

export default function AboutUs() {
    return (
        <div>
            <Navbar/>
        
        <div className="font-sans text-gray-800">
          {/* Topic Section */}
          <section className="py-4 text-center">
            <h1 className="text-4xl font-extrabold text-gray-800">About Us</h1>
          </section>

          {/* Hero Section */}
          <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage:  `url(${bg})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center text-center px-4">
              <h1 className="text-white text-2xl font-medium">
                Let Tickets.lk take care of your travel plans,<br />
                so you can focus on enjoying your journey.
              </h1>
            </div>
          </section>
    
         
    
          {/* Why Choose Us */}
          <section className="py-10 bg-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-red-500">Why Choose Us?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
              {[
                { title: "Convenience", desc: "Book anytime, anywhere with 24/7 access." },
                { title: "Best Prices", desc: "We offer great deals from top travel providers." },
                { title: "Reliable Support", desc: "Our customer service is here to assist every step of the way." },
                { title: "Secure Transactions", desc: "Your payment information is always safe with us." },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
    
          {/* Description Section */}
          <section className="py-12 px-4 max-w-5xl mx-auto">
            <p className="mb-6">
              At Tickets.lk, we understand that traveling is not just about reaching a destination, it's about the journey. Whether you're planning a family vacation, a business trip, or a spontaneous getaway, we’re here to make your travel experience seamless, enjoyable, and affordable.
            </p>
            <p className="mb-6">
              Founded with the mission to make booking travel tickets easier and more accessible, Tickets.lk is Sri Lanka’s premier online travel booking platform. We provide a simple and secure platform to discover and compare travel services from airlines, rail operators, and bus lines. Our easy-to-use interface allows travelers of all ages and backgrounds to search a wide variety of options to suit your budget, schedule, and preferences.
            </p>
            <p>
              We specialize in helping travelers book their tickets effortlessly through our user-friendly website. Whether you're booking a one-way trip, roundtrip, or group travel, Tickets.lk makes the process quick, simple, and hassle-free. With our wide selection of travel providers and transparent pricing, we ensure that you get the best deal for your travel needs.
            </p>
          </section>
    
          {/* Contact Form */}
          <section className="bg-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium"
                  >
                    Submit
                  </button>
                </form>
                <img
                  src="https://via.placeholder.com/400x300"
                  alt="Deer"
                  className="w-full h-auto rounded-md shadow-md"
                />
              </div>
            </div>
          </section>
    
         <Footer/>
        </div>
        </div>
      );
}


