import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import Registration from './pages/signup';
import Registration2 from './pages/signup2';
import ForgotPassword from './pages/forgot-password';
import ChangePassword from './pages/change-password';
import AboutUs from './pages/about-us';
import Home from './pages/home';
import Categories from './pages/categories';
import Profile from './pages/profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Component to conditionally render navbar based on route
const AppContent = () => {
  const location = useLocation();
  const authRoutes = ['/login', '/signup', '/signup2', '/forgot-password', '/change-password', '/'];
  
  // Don't show navbar on authentication pages
  const showNavbar = !authRoutes.includes(location.pathname);
  const showFooter = !authRoutes.includes(location.pathname);
  
  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/signup" element={<Registration />} />
        <Route path="/signup2" element={<Registration2 />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword/>} />
        <Route path="/aboutus" element={<AboutUs/>} />
        <Route path="/categories" element={<Categories/>} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
