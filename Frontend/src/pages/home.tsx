import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/home-components/Hero';
import SpecialOffers from '../components/home-components/SpecialOffers';
import TravelActivities from '../components/home-components/TravelActivities';

const Home = () => {
  console.log("Rendering Index component"); // Debugging log

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Hero/>
        <SpecialOffers/>
        <TravelActivities />
      </div>
   
    </div>
  );
};

export default Home;
