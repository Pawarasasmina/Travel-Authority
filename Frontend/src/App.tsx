import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import Registration from './pages/signup';
import ForgotPassword from './pages/forgot-password';
import ChangePassword from './pages/change-password';
import AboutUs from './pages/about-us';
import Home from './pages/home';
import Categories from './pages/categories';
import Profile from './pages/profile';
import PurchaseList from './pages/purchase-list';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ActivityDetail from './components/activities/ActivityDetail';
import BookedTicketPage from './pages/booked-ticket-page';
import PeopleCountSelector from './pages/PeopleCountSelector';
import PaymentSuccess from './pages/PaymentSuccess';
import NotificationsPage from './pages/notifications';
import ProtectedRoute from './components/ProtectedRoute';


// Component to conditionally render navbar based on route
const AppContent = () => {
  const location = useLocation();
  const authRoutes = ['/login', '/signup', '/signup2', '/forgot-password', '/change-password', '/'];
  
  // Pages that should have transparent navbar
  const transparentNavbarRoutes = [
    '/activities', // For any activity detail page
    '/home',
    
    
  ];
  
  // Pages that should always show navbar background, regardless of other rules
  const forceNavbarBackgroundRoutes = [
    '/purchase-list',
    '/profile',
    '/categories',
    '/aboutus',
    '/bookings',
    '/booking' // Add booking paths to force navbar background
  ];
  
  // Check if current path exactly matches or starts with any route that should force navbar background
  const shouldForceNavbarBackground = forceNavbarBackgroundRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );
  
  // Check if current route should have transparent navbar
  const shouldHaveTransparentNavbar = !shouldForceNavbarBackground && transparentNavbarRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  // Don't show navbar on authentication pages
  const showNavbar = !authRoutes.includes(location.pathname);
  const showFooter = !authRoutes.includes(location.pathname);
  
  return (
    <>
      {showNavbar && <Navbar transparent={shouldHaveTransparentNavbar} />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Login />} />      
        <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path="/signup" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword/>} />
        <Route path="/aboutus" element={<AboutUs/>} />
        <Route path="/categories" element={<ProtectedRoute><Categories/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/purchase-list" element={<ProtectedRoute><PurchaseList /></ProtectedRoute>} />
        <Route path="/activities/:id/:title" element={<ProtectedRoute><ActivityDetail /></ProtectedRoute>} />
        <Route path="/booking/people-count" element={<ProtectedRoute><PeopleCountSelector /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookedTicketPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
