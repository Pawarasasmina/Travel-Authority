import React from 'react';
import { useNavigate } from 'react-router-dom';
import image1 from '../../assets/home-images/event-images/1.jpg';
import image2 from '../../assets/home-images/event-images/2.jpg';
import image3 from '../../assets/home-images/event-images/3.jpg';
import image4 from '../../assets/home-images/event-images/4.jpg';
import image5 from '../../assets/home-images/event-images/5.jpg';
import image6 from '../../assets/home-images/event-images//6.jpg';
import image7 from '../../assets/home-images/event-images/7.jpg';
import image8 from '../../assets/home-images/event-images/8.jpg';
import image9 from '../../assets/home-images/event-images/9.jpg';
import image10 from '../../assets/home-images/event-images/10.jpg';
import image11 from '../../assets/home-images/event-images/11.jpg';
import image12 from '../../assets/home-images/event-images/12.jpg';
import image13 from '../../assets/home-images/event-images/13.jpg';
import image14 from '../../assets/home-images/event-images/14.jpg';
import image15 from '../../assets/home-images/event-images/15.jpg';
import image16 from '../../assets/home-images/event-images/16.jpg';

interface ActivityCardProps {
  image: string;
  title: string;
  location: string;
  id: number;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ image, title, location, onClick }) => {
  return (
    <div 
      className="rounded-lg overflow-hidden shadow-md group cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-3 text-center">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500">{location}</p>
      </div>
    </div>
  );
};

export const ACTIVITIES = [
  { id: 1, title: "White Water Rafting", location: "Kitulgala", image: image1 },
  { id: 2, title: "Uva Tea Factory Tour", location: "Haputale", image: image2 },
  { id: 3, title: "Birds Safari Tour", location: "Bundala", image: image3 },
  { id: 4, title: "Flying Ravana", location: "Ella", image: image4 },
  { id: 5, title: "Dolphin Watching", location: "Kalpitiya", image: image5 },
  { id: 6, title: "Paramotoring", location: "Bentota", image: image6 },
  { id: 7, title: "Forest Monastery", location: "Mihintale", image: image7 },
  { id: 8, title: "Hill Country Adventures", location: "Haputale", image: image8 },
  { id: 9, title: "Deep Sea Fishing", location: "Bentota", image: image9 },
  { id: 10, title: "Nine Arches Bridge", location: "Ella", image: image10 },
  { id: 11, title: "Fort Frederick", location: "Trincomalee", image: image11 },
  { id: 12, title: "Jungle Beach", location: "Unawatuna", image: image12 },
  { id: 13, title: "Galle Day Trip", location: "Galle", image: image13 },
  { id: 14, title: "Wilpattu Park Safari", location: "Kalpitiya", image: image14 },
  { id: 15, title: "Whale Watching", location: "Mirissa", image: image15 },
  { id: 16, title: "Cycle down to Hatton", location: "Nuwara Eliya", image: image16 },
];

const TravelActivities = () => {
  const navigate = useNavigate();
  
  const handleActivityClick = (id: number, title: string) => {
    // Convert title to URL-friendly format
    const slugTitle = title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/activities/${id}/${slugTitle}`);
  };
  
  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">Your Ultimate Travel Companion</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {ACTIVITIES.map((activity) => (
          <ActivityCard 
            key={activity.id}
            id={activity.id}
            title={activity.title}
            location={activity.location}
            image={activity.image}
            onClick={() => handleActivityClick(activity.id, activity.title)}
          />
        ))}
      </div>
    </section>
  );
};

export default TravelActivities;
