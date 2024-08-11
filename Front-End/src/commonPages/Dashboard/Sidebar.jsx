import React, { useState, useEffect } from 'react';
import profilePic from '../../assets/profilePic.jpg';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(localStorage.getItem('sidebar-collapsed') === 'true');

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
        </ul>
      </nav>
      <div className="user-profile">
        <img src={profilePic} alt="Profile Icon" className="profile-image" />
        <a href="#" className="profile-name">My Profile</a>
      </div>
    </aside>
  );
}

export default Sidebar;
