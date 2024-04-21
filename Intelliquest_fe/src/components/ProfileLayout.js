import React from 'react';
import './ProfileLayout.css';  // Import your CSS file
import Header from './Header';  // Make sure this component is properly defined
import Sidebar from './SideBar';  // Make sure this component is properly defined
import { useLocation } from 'react-router-dom';

const ProfileLayout = ({ children }) => {
    const location = useLocation(); // This hook returns the location object
    const shouldShowHeader = location.pathname.includes('myprofile');
    console.log("Current Location:", location);
    console.log("Is 'myprofile' in path?", shouldShowHeader);

    return (
        <div className="App"> {/* This class is used to provide a top padding */}
            <div className="header">
                    {shouldShowHeader ? <Header /> : <div>No Header</div>}
                </div>
            <div className="sidebar">
                <Sidebar />
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default ProfileLayout;