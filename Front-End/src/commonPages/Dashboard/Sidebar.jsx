import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profilePic from '../../assets/profilePic2.webp';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(localStorage.getItem('sidebar-collapsed') === 'true');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('sidebar-collapsed', !collapsed);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.user-profile')) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [dropdownVisible]);

  const handleLogout = () => {
    // Remove tokens from localStorage or sessionStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Redirect to the login page
    navigate('/');
  };

  return (
    <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <h2 className="app-logo">My App</h2>
        <button id="sidebar-toggle-btn" onClick={toggleSidebar}>&#9776;</button>
      </div>
      <nav className="sidebar-navigation">
        <ul className="nav-list">
          <li><a href="#" className="nav-link active">Dashboard</a></li>
          <li><a href="#" className="nav-link">Option 1</a></li>
          <li><a href="#" className="nav-link">Option 2</a></li>
          <li><a href="#" className="nav-link">Option 3</a></li>
          <li><a href="#" className="nav-link">Question Generator</a></li>
          <li><a href="/chat" className="nav-link">EduGuideBot</a></li>
        
        </ul>
      </nav>
      <div className="user-profile" onClick={toggleDropdown}>
        <img src={profilePic} alt="Profile Icon" className="profile-image" />
        <a href="#" className="profile-name">My Profile</a>
        {dropdownVisible && (
          <div className={`dropdown-menu ${collapsed ? 'collapsed-menu' : ''}`}>
            <ul>
              <li><a href="#" onClick={() => navigate('/settings')}>Settings</a></li>
              <li><a href="#" onClick={handleLogout}>Log Out</a></li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
