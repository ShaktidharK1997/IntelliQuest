import React from 'react';
import './ProfileLayout.css';  // Import your CSS file
import Header from './Header';  // Make sure this component is properly defined
import Sidebar from './SideBar';  // Make sure this component is properly defined

const ProfileLayout = ({ children }) => {
    return (
        <div className="App"> {/* This class is used to provide a top padding */}
            <div className="header">
                <Header />
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