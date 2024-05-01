import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideBar.css'; // Make sure your CSS styles are correctly named and imported

function Sidebar() {
  return (
    <div className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/myprofile"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Personal Information
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/myprofile/education"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Education
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/myprofile/experience"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Experience
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/myprofile/publications"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Published Articles
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/myprofile/bookmarks"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Bookmarks
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
