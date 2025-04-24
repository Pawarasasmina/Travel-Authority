import heroImage from '../../assets/home-images/wallpaperHome.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-start">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: `url(${heroImage})` 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-left px-6 md:px-12 lg:px-0 lg:ml-20">
        {/* <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-4">
          Hello<br />Travelers
        </h1>
        <p className="text-white text-lg max-w-2xl">
          Discover breathtaking destinations, unbeatable deals, and hassle-free bookings—all in 
          one place! Whether you're planning a weekend getaway or a dream vacation, Travel.LK 
          makes it easy and affordable.
        </p> */}
      </div>
    </section>
  );
};

export default Hero;