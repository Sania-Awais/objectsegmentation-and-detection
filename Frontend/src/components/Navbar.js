import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Aleeza Rubab',
    email: 'malikaleeza1122@gmail.com',
    image: '/images/SAlogo.jpg', // Placeholder image path
  });

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSignOut = () => {
    console.log('Sign out');
  };

  const handleProfileChange = (newProfile) => {
    setProfile(newProfile);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={'/images/SAlogo.jpg'} alt="Logo" className="logo" />
        <div className="navbar-brand">Dashboard</div>
      </div>
      <div className="navbar-right">
        <button className="nav-button" onClick={onLoginClick}>Login</button>
        <button className="nav-button" onClick={onSignupClick}>Signup</button>
        <div className="profile" onClick={toggleDropdown}>
          <img src={profile.image} alt="Profile" className="icon" />
          <span>{profile.name}</span>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <img src={profile.image} alt="Profile" className="dropdown-icon" />
                <div>
                  <div className="dropdown-name">{profile.name}</div>
                  <div className="dropdown-email">{profile.email}</div>
                </div>
              </div>
              <div className="dropdown-item" onClick={handleSignOut}>Sign Out</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
