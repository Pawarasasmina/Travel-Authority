import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Registration from './pages/signup';
import Registration2 from './pages/signup2';
import ForgotPassword from './pages/forgot-password';
import ChangePassword from './pages/change-password';
import AboutUs from './pages/about-us';
import Home from './pages/home';
import Categories from './pages/Categories';


function App() {
  return (
    <Router>
  
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


      </Routes>


    </Router>
  );
}

export default App;
