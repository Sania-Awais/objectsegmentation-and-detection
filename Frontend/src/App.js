import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Upload from './components/Upload';
import ObjectSegmentation from './components/ObjectSegmentation';
import ObjectDetection from './components/ObjectDetection';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleClose = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="app">
      <Navbar onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
      <div className="main-content">
        <Upload />
        <ObjectSegmentation />
        <ObjectDetection />
      </div>
      <Footer />
      {showLogin && <Login onClose={handleClose} />}
      {showSignup && <Signup onClose={handleClose} />}
    </div>
  );
};

export default App;
