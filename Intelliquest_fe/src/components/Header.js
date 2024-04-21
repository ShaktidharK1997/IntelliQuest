// Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css'; // Make sure to create this CSS file for styling

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const location = useLocation();  // This hook gives you the current location object

    // Determine the label based on the current path
  const pageLabel = location.pathname.includes('/myprofile') ? 'Homepage' : 'Settings';

  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/">
          <img src='/images/home_logo.png' alt="Logo" />
        </Link>
      </div>
      <div className="header-profile">
        <div onClick={toggleDropdown}>
            
          {/* Profile Icon - You can replace this with an actual icon image or icon component */}
          <img src="/images/profile_icon.jpeg" alt="Profile" className="profile-icon" />
        </div>
        {isDropdownOpen && (
          <div className="profile-dropdown">
            <Link to="/" onClick={() => setIsDropdownOpen(false)}>{pageLabel}</Link>
            <Link to="/support" onClick={() => setIsDropdownOpen(false)}>Support</Link>
            <Link to="/" onClick={() => setIsDropdownOpen(false)}>Logout</Link>
            <button onClick={handleLogout}>Logout</button>
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
