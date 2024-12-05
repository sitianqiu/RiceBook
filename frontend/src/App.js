import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './components/Landing/LandingPage';
import MainPage from './components/Main/MainPage';
import ProfilePage from './components/Profile/ProfilePage';
import './App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [loggedInUser, setLoggedInUser] = useState(null); 
  const [logoutMessage, setLogoutMessage] = useState(''); 

    // Function to update the loggedInUser's avatar
    const refreshAvatar = async () => {
      try {
        const response = await fetch('https://rbqserver-742880fd6875.herokuapp.com/profile', {
          credentials: 'include',
        });
        const data = await response.json();
        setLoggedInUser((prevUser) => ({
          ...prevUser,
          avatar: data.avatar,
        }));
      } catch (error) {
        console.error('Error refreshing avatar:', error);
      }
    };

  const toUpdateUser = (updatedUser) => {
    setLoggedInUser(updatedUser); 
  };

  return (
      <Router>
          <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setLogoutMessage={setLogoutMessage} />

          <Routes>
              <Route
                  path="/"
                  element={<LandingPage setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} logoutMessage={logoutMessage} />}
              />
              
              {/* Protect the main page and profile page */}
              <Route path="/main" element={isLoggedIn ? <MainPage loggedInUser={loggedInUser} /> : <Navigate to="/" />} />
              <Route path="/profile" element={isLoggedIn ? <ProfilePage refreshAvatar={refreshAvatar} />: <Navigate to="/" />} />

              {/* Redirect any undefined routes to the LandingPage */}
              <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </Router>
  );
}

export default App;
