// Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css'; // Make sure to create this CSS file for styling
import {useAuth} from '../contexts/AuthContext'
function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { signOut} = useAuth();
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const location = useLocation();  // This hook gives you the current location object

    // Determine the label based on the current path
  const pageLabel = location.pathname.includes('/myprofile') ? 'Homepage' : 'MyProfile';

  return (
    <header className="head">
      <div className="head-logo">
        <Link to="/">
          <img src='/images/home_logo.png' alt="Logo" />
        </Link>
      </div>
      <div className="head-profile">
        <div onClick={toggleDropdown}>
            
          {/* Profile Icon - You can replace this with an actual icon image or icon component */}
          <img src="/images/profile_icon.jpeg" alt="Profile" className="profile-icon" />
        </div>
        {isDropdownOpen && (
          <div className="profile-dropdown">
            <Link to="/" onClick={() => setIsDropdownOpen(false)}>{pageLabel}</Link>
            <Link to="/" onClick={() => setIsDropdownOpen(false)}>Support</Link>
            <button onClick={signOut}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

// Placeholder function for the logout logic
const handleLogout = () => {
  // Implement your logout logic here
  console.log('User logged out');
};
