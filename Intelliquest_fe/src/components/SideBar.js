import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideBar.css'; // Make sure to create a Sidebar.css file for styling

function Sidebar() {
  return (
    <div className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/myprofile" activeClassName="active">
              Personal Information
            </NavLink>
          </li>
          <li>
            <NavLink to="/myprofile/education" activeClassName="active">
              Education
            </NavLink>
          </li>
          <li>
            <NavLink to="/myprofile/experience" activeClassName="active">
              Experience
            </NavLink>
          </li>
          <li>
            <NavLink to="/myprofile/publications" activeClassName="active">
              Published Articles
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
